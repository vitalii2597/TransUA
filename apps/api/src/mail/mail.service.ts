import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type Lang = 'uk' | 'no' | 'sv' | 'pl';

const RESET_COPY: Record<Lang, { subject: string; body: (link: string) => string }> = {
  uk: {
    subject: 'TransUA — відновлення пароля',
    body: (link) =>
      `Ми отримали запит на зміну пароля до вашого акаунту TransUA.\n\nЩоб встановити новий пароль, перейдіть за посиланням (дійсне 1 годину):\n${link}\n\nЯкщо ви не надсилали цей запит, просто проігноруйте цей лист.`,
  },
  no: {
    subject: 'TransUA — tilbakestill passord',
    body: (link) =>
      `Vi har mottatt en forespørsel om å tilbakestille passordet til TransUA-kontoen din.\n\nFølg lenken for å velge et nytt passord (gyldig i 1 time):\n${link}\n\nHvis du ikke ba om dette, kan du se bort fra denne e-posten.`,
  },
  sv: {
    subject: 'TransUA — återställ lösenord',
    body: (link) =>
      `Vi har fått en begäran om att återställa lösenordet till ditt TransUA-konto.\n\nFölj länken för att välja ett nytt lösenord (giltig i 1 timme):\n${link}\n\nOm du inte begärde detta kan du ignorera det här mejlet.`,
  },
  pl: {
    subject: 'TransUA — resetowanie hasła',
    body: (link) =>
      `Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta TransUA.\n\nKliknij link, aby ustawić nowe hasło (ważny przez 1 godzinę):\n${link}\n\nJeśli to nie Ty wysłałeś prośbę, zignoruj tę wiadomość.`,
  },
};

// Sends through SendGrid's HTTP API when SENDGRID_API_KEY is set. Without a key, the
// message is printed to the console only if MAIL_LOG_TO_CONSOLE=true (local dev opt-in),
// so a deploy that forgets an env var never ends up writing live reset links to its logs.
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {}

  async sendPasswordReset(to: string, link: string, lang: string) {
    const copy = RESET_COPY[(lang as Lang)] ?? RESET_COPY.uk;
    await this.send(to, copy.subject, copy.body(link));
  }

  private async send(to: string, subject: string, text: string) {
    const apiKey = this.config.get<string>('SENDGRID_API_KEY');
    if (!apiKey) {
      if (this.config.get('MAIL_LOG_TO_CONSOLE') === 'true') {
        this.logger.log(`[dev mail] to=${to} subject="${subject}"\n${text}`);
      } else {
        this.logger.error(`SENDGRID_API_KEY not set — email "${subject}" was not sent`);
      }
      return;
    }

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: {
          email: this.config.get('SENDGRID_FROM_EMAIL') || 'noreply@transua.no',
          name: this.config.get('SENDGRID_FROM_NAME') || 'TransUA',
        },
        subject,
        content: [{ type: 'text/plain', value: text }],
      }),
    });
    if (!res.ok) {
      this.logger.error(`SendGrid rejected email "${subject}": ${res.status} ${await res.text()}`);
    }
  }
}

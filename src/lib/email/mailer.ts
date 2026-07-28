import nodemailer, { type Transporter } from "nodemailer";

export interface SendMailParams {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}

let cachedTransporter: Transporter | null = null;
let cachedEtherealAccount: { user: string; pass: string } | null = null;

async function getTransporter(): Promise<Transporter> {
  if (cachedTransporter) return cachedTransporter;

  if (process.env.SMTP_HOST) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_PORT === "465",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
    return cachedTransporter;
  }

  if (process.env.EMAIL_DEV_MODE === "ethereal") {
    if (!cachedEtherealAccount) {
      cachedEtherealAccount = await nodemailer.createTestAccount();
    }
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: cachedEtherealAccount,
    });
    return cachedTransporter;
  }

  // console 模式：不建立真的 transporter，寄信時直接印出內容
  return null as unknown as Transporter;
}

/**
 * 寄送失敗不應讓呼叫端的主流程（例如建立訂單）失敗，因此這裡吞掉所有錯誤只記錄 log，
 * 呼叫端可依回傳值決定是否記錄「尚未寄出」讓後台之後能人工重寄。
 */
export async function sendMail(params: SendMailParams): Promise<{ ok: boolean }> {
  try {
    const isConsoleMode = !process.env.SMTP_HOST && process.env.EMAIL_DEV_MODE !== "ethereal";

    if (isConsoleMode) {
      console.log("========== [開發模式] 模擬寄送 Email ==========");
      console.log("收件者:", params.to);
      console.log("主旨:", params.subject);
      console.log("內文 (HTML):", params.html);
      console.log("附件:", params.attachments?.map((a) => a.filename).join(", ") ?? "無");
      console.log("=================================================");
      return { ok: true };
    }

    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM ?? "睿煬旅行社 <no-reply@example.com>",
      to: params.to,
      subject: params.subject,
      html: params.html,
      attachments: params.attachments,
    });

    if (process.env.EMAIL_DEV_MODE === "ethereal") {
      console.log("[Ethereal 預覽連結]", nodemailer.getTestMessageUrl(info));
    }

    return { ok: true };
  } catch (error) {
    console.error("寄送 Email 失敗:", error);
    return { ok: false };
  }
}

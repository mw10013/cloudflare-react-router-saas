import { invariant } from "@epic-web/invariant";
import { AwsClient } from "aws4fetch";
import { env } from "cloudflare:workers";

/*

// https://www.daniel-mitchell.com/blog/send-email-with-aws-ses-in-a-cloudflare-workers/
// https://www.ai.moda/en/blog/ses-emails-from-workers
// https://github.com/winstxnhdw/mail-worker

{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "Statement1",
			"Effect": "Allow",
			"Action": "ses:SendEmail",
			"Resource": "*",
			"Condition": {
				"StringEquals": {
					"ses:FromAddress": "motio@mail.com"
				}
			}
		}
	]
}

*/

export interface SesService {
  sendEmail: ({
    to,
    from,
    html,
    text,
    subject,
  }: {
    to: string;
    from: string;
    html: string;
    text: string;
    subject: string;
  }) => Promise<void>;
}

export function createSesService(): SesService {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (env.DEMO_MODE === "true") {
    return {
      sendEmail: ({ to, from, text, subject }) => {
        console.log(`ses: sendEmail: DEMO_MODE`, {
          to,
          from,
          subject,
          text,
        });
        return Promise.resolve();
      },
    };
  }

  invariant(env.AWS_SES_ACCESS_KEY_ID, "Missing AWS_SES_ACCESS_KEY_ID");
  invariant(env.AWS_SES_SECRET_ACCESS_KEY, "Missing AWS_SES_SECRET_ACCESS_KEY");
  invariant(env.AWS_SES_ENDPOINT, "Missing AWS_SES_ENDPOINT");
  invariant(env.AWS_SES_REGION, "Missing AWS_SES_REGION");
  const emailWhitelist = process.env.EMAIL_WHITE_LIST
    ? process.env.EMAIL_WHITE_LIST.split(",")
    : [];

  const aws = new AwsClient({
    accessKeyId: env.AWS_SES_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SES_SECRET_ACCESS_KEY,
    region: env.AWS_SES_REGION,
    retries: 1,
  });

  const sendEmail = async ({
    to,
    from,
    html,
    text,
    subject,
  }: {
    to: string;
    from: string;
    html: string;
    text: string;
    subject: string;
  }) => {
    console.log(`ses: sendEmail`, { to, from, subject, text });
    if (emailWhitelist.length > 0 && !emailWhitelist.includes(to)) {
      console.log(
        `ses: sendEmail: skipping ${to} because it is not in the whitelist`,
      );
      return;
    }
    const response = await aws.fetch(env.AWS_SES_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        FromEmailAddress: from,
        Destination: {
          ToAddresses: [to],
        },
        Content: {
          Simple: {
            Subject: {
              Data: subject,
            },
            Body: {
              Text: {
                Data: text,
              },
              ...(html && {
                Html: {
                  Data: html,
                },
              }),
            },
          },
        },
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `ses: error sending email: ${String(response.status)} ${response.statusText} ${text}`,
      );
    }
  };

  return {
    sendEmail,
  };
}

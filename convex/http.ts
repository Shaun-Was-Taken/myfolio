import { httpRouter, HttpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { internal } from "./_generated/api";

const http = httpRouter();

const clerkWebhook = httpAction(async (ctx, request) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

  if (!webhookSecret) {
    return new Response("No webhook secret", { status: 400 });
  }

  const svix_id = request.headers.get("svix-id");
  const svix_timestamp = request.headers.get("svix-timestamp");
  const svix_signature = request.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(webhookSecret);

  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response("Error verifying webhook", { status: 400 });
  }

  const evenType = event.type;

  if (evenType == "user.created") {
    const { id, email_addresses, first_name, last_name, image_url, username } =
      event.data;
    const email = email_addresses[0].email_address;
    const name = `${first_name} ${last_name}`;

    try {
      await ctx.runMutation(internal.user.createUser, {
        clerkId: id,
        email,
        name,
        imageUrl: image_url,
        username: username!,
      });
    } catch (err) {
      return new Response("Error creating user", { status: 400 });
    }
  } else if (evenType == "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url, username } =
      event.data;
    const email = email_addresses[0].email_address;
    const name = `${first_name} ${last_name}`;
    try {
      await ctx.runMutation(internal.user.updateUser, {
        clerkId: id,
        email,
        name,
        imageUrl: image_url,
        username: username!,
      });
    } catch (err) {
      return new Response("Error updating user", { status: 400 });
    }
  }

  return new Response("Event received", { status: 200 });
});

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: clerkWebhook,
});

export default http;

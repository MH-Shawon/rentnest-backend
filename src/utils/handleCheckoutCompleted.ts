import Stripe from "stripe";
import { prisma } from "../lib/prisma";
import { PaymentStatus, RequestStatus } from "../../generated/prisma/enums";

export const handleCheckoutCompleted = async (
  session: Stripe.Checkout.Session
) => {

  const paymentId = session.metadata?.paymentId;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: {
        OR: [
          ...(paymentId ? [{ id: paymentId }] : []),
          { stripeSessionId: session.id },
        ],
      },
    });

    if (!payment) {
      console.log("Payment not found for session:", session.id);
      return;
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      return;
    }

    await tx.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        transactionId: paymentIntentId ?? payment.transactionId ?? null,
        stripeSessionId: session.id,
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
    });

    await tx.rentalRequest.update({
      where: {
        id: payment.rentalRequestId,
      },
      data: {
        status: RequestStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  });
};
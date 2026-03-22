import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { AppError, handleRouteError } from "@/lib/errors";
import { successResponse } from "@/lib/helpers/response";

/**
 * @swagger
 * /api/v1/addresses/{id}:
 *   put:
 *     summary: Update existing address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               recipient_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               full_address:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       401:
 *         description: Unauthorized
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = await verifyAuth(request);
    const userId = payload.userId;

    const body = await request.json();
    const { label, recipient_name, phone, full_address, notes } = body;

    const address = await prisma.address.findUnique({ where: { id } });

    if (!address) {
      throw AppError.notFound("Address not found");
    }

    if (address.userId !== userId) {
      throw AppError.forbidden("Not authorized to update this address");
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        ...(label && { label }),
        ...(recipient_name && { recipientName: recipient_name }),
        ...(phone && { phone }),
        ...(full_address && { fullAddress: full_address }),
        ...(notes !== undefined && { notes }),
      },
    });

    return successResponse(
      { address_id: updated.id, label: updated.label, updated_at: updated.updatedAt },
      { message: "Address updated successfully" },
    );
  } catch (error) {
    return handleRouteError(error, "Update address");
  }
}

/**
 * @swagger
 * /api/v1/addresses/{id}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       401:
 *         description: Unauthorized
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = await verifyAuth(request);
    const userId = payload.userId;

    const address = await prisma.address.findUnique({ where: { id } });

    if (!address) {
      throw AppError.notFound("Address not found");
    }

    if (address.userId !== userId) {
      throw AppError.forbidden("Not authorized to delete this address");
    }

    await prisma.address.delete({ where: { id } });

    return successResponse(undefined, { message: "Address deleted successfully" });
  } catch (error) {
    return handleRouteError(error, "Delete address");
  }
}

/**
 * @swagger
 * /api/v1/addresses/{id}:
 *   patch:
 *     summary: Partially update an address (e.g., set as primary)
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_primary:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated
 *       401:
 *         description: Unauthorized
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = await verifyAuth(request);
    const userId = payload.userId;

    const body = await request.json();
    const { is_primary } = body;

    const address = await prisma.address.findUnique({ where: { id } });

    if (!address) {
      throw AppError.notFound("Address not found");
    }

    if (address.userId !== userId) {
      throw AppError.forbidden("Not authorized to update this address");
    }

    if (is_primary === true) {
      await prisma.address.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        ...(is_primary !== undefined && { isPrimary: is_primary }),
      },
    });

    return successResponse(
      { address_id: updated.id, is_primary: updated.isPrimary },
      { message: "Address updated successfully" },
    );
  } catch (error) {
    return handleRouteError(error, "Patch address");
  }
}

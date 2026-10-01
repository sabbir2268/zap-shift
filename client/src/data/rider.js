/*
 * Reading a rider's own record.
 *
 * A rider's identity is snapshotted onto their user record when an admin approves
 * their application, and that snapshot is what every rider page reads.
 *
 * The service center used to be called `warehouse` on that snapshot, so riders
 * approved before the rename carry the hub under the old name. Both are read here
 * so a rider never sees a blank service center on their own dashboard just
 * because they joined before the field was renamed.
 */

export const getRiderServiceCenter = (rider) =>
  rider?.serviceCenter || rider?.warehouse || "";
/**
 * Poster headlines for the service cards (owner's reference: cardoctorltd.com
 * service images — photo, brand shape, bold two-line headline, contact strip).
 * Drawn by the site over the photo, so the text stays sharp and editable.
 * `focus` = CSS object-position for cropping the photo (square service cards,
 * tall home carousel cards) so the person doing the job stays in frame.
 * Unknown slugs fall back to the service name.
 */
export const SERVICE_POSTERS = {
  "engine-brake-servicing": { top: "Strong engine", bottom: "Safe brakes", focus: "50% 40%" },
  "computerized-diagnosis": { top: "We scan first", bottom: "Then we fix", focus: "45% 35%" },
  "diagnosis-repair": { top: "Found it.", bottom: "Fixed it right", focus: "50% 18%" },
  denting: { top: "Every dent", bottom: "Back in shape", focus: "50% 58%" },
  "body-painting-detailing": { top: "Booth-painted", bottom: "Factory shine", focus: "50% 35%" },
  "wheel-alignment": { top: "Drive straight", bottom: "Save your tyres", focus: "50% 62%" },
  "routine-maintenance": { top: "Fresh oil", bottom: "Smooth miles", focus: "50% 40%" },
  "battery-replacement": { top: "No more", bottom: "Dead starts", focus: "100% 50%" },
};

export function servicePoster(service) {
  return SERVICE_POSTERS[service.slug] ?? { top: service.name, bottom: "", focus: "50% 40%" };
}

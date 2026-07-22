// declare global {
//   interface Window {
//     dataLayer: Array<Record<string, any>>;
//   }
// }

interface DataLayerPayload extends Record<string, any> {
  event?: string;
}

export const pushToDataLayer = (
  event: string | DataLayerPayload,
  data?: Record<string, any>
) => {
  
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];

    if (typeof event === "string") {
      window.dataLayer.push({
        event,
        ...data,
      });
    } else {
      window.dataLayer.push(event);
    }
  }
};

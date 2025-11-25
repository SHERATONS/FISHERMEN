// reportWebVitals.js

export const loadWebVitals = () => import('web-vitals');

const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && typeof onPerfEntry === "function") {
    loadWebVitals().then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;

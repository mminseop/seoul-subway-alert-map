import { ClipLoader } from "react-spinners";

function LoadingIndicator({ loadingText }) {
  return (
    <div className="loading-wrap">
      <ClipLoader color="#666" size={50} />
      <div className="loading-text">{loadingText}...</div>
    </div>
  );
}

export default LoadingIndicator;

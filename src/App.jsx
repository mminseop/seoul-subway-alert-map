import { useEffect, useState } from "react";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import "./App.css";
import LoadingIndicator from "./components/LoadingIndicator";

function App() {
  const [alerts, setAlerts] = useState([]); // 초기값 빈 배열로 변경
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 알림 데이터 API 호출 함수
  const fetchAlerts = async () => {
    setLoading(true);
    setError("");
    try {
      const baseUrl = "https://apis.data.go.kr/B553766/ntce/getNtceList";
      const serviceKey = import.meta.env.VITE_SERVICE_KEY;
      const url = `${baseUrl}?serviceKey=${serviceKey}&numOfRows=30&pageNo=1`;

      const response = await axios.get(url, { responseType: "text" });
      const parser = new XMLParser();
      const json = parser.parse(response.data);

      // item 데이터 추출 (배열 또는 단일 객체 처리)
      const rawItems = json?.response?.body?.items?.item;
      const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

      setAlerts(items);
    } catch (err) {
      setError(err.message || "데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 알림 내용과 시간 문자열을 분리 처리하는 함수
  const processContent = (content, timeString) => {
    if (!content) return { text: "", time: "" };

    // 줄바꿈 문자 변환 및 공백 제거
    let text = content.replace(/&#xd;/g, "\n").trim();
    text = text.replace(/\s+$/, "");

    // 맨 뒤 날짜 시간 제거 (예: '08-05 06:55:54' 길이 14)
    const possibleTime = text.slice(-14);
    if (/^\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(possibleTime)) {
      text = text.slice(0, -14).trim();
    }

    // ISO 8601 시간 문자열 형식 변환
    const time = timeString ? timeString.replace("T", " ").slice(0, 19) : "";

    return { text, time };
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="app-container">
      <h1 className="title">실시간 지하철 알림정보</h1>

      <button onClick={fetchAlerts} className="fetch-button" disabled={loading}>
        {loading ? "불러오는 중..." : "실시간 정보 다시 불러오기"}
      </button>

      {loading && <LoadingIndicator loadingText="데이터를 불러오는 중" />}

      {!loading && error && (
        <div className="message error">에러가 발생했습니다: {error}</div>
      )}

      {!loading && !error && alerts.length === 0 && (
        <div className="message no-data">알림 정보가 없습니다.</div>
      )}

      {!loading && !error && alerts.length > 0 && (
        <div className="alerts-container">
          {alerts.map((alert, idx) => {
            const { text, time } = processContent(
              alert.noftCn,
              alert.noftOcrnDt
            );

            return (
              <div key={idx} className="alert-card">
                <h2 className="alert-title">{alert.noftTtl}</h2>
                <p className="alert-content">{text}</p>
                {time && <p className="alert-time">{time}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default App;

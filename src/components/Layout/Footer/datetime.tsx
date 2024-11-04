import { useState, useEffect } from "react";
import dayjs from "dayjs";

const DateTime = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return <span>{dayjs(dateTime).format("MMM, D YYYY, h:mm:ss a")}</span>;
};

export default DateTime;
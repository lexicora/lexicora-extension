import React, { useEffect, useState } from "react";
import { RxDatabaseProvider } from "rxdb/plugins/react";
import type { RxDatabase } from "rxdb";
import { getDb } from "@/db";

const App = ({ children }: { children: React.ReactNode }) => {
  const [database, setDatabase] = useState<RxDatabase>();

  useEffect(() => {
    const initDb = async () => {
      const db = await getDb();
      setDatabase(db);
    };
    initDb();
  }, []);

  if (!database) {
    // Returning null prevents UI flashes (it renders nothing),
    // but crucially it prevents child components from crashing by trying to
    // query an undefined database before initialization is complete.
    return null;
  }

  return (
    <RxDatabaseProvider database={database}>{children}</RxDatabaseProvider>
  );
};

export default App;

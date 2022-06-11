import utils from "@/utils";
import {
  Component,
  createContext,
  createSignal,
  ParentProps,
  useContext,
  on,
  createEffect,
  batch,
  Accessor,
} from "solid-js";

export type TickerMethods = {
  onEachSecond: (cb: (time?: number) => void) => void;
  onEachDay: (cb: (tomorrow?: Date) => void) => void;
  tomorrow: Accessor<Date>;
};

export const TickerContext = createContext<TickerMethods>({} as TickerMethods);

type TickerProps = { date: Date };

export const Ticker: Component<ParentProps & TickerProps> = ({
  date,
  children,
}) => {
  const [tomorrow, setTomorrow] = createSignal(utils.tomorrow()),
    [time, setTime] = createSignal(date.getTime());

  setInterval(() => {
    batch(() => {
      setTime((prev) => prev + 1000);
      const now = new Date().setHours(0, 0, 0, 0);
      if (now >= tomorrow().getTime()) {
        setTomorrow(utils.tomorrow());
      }
    });
  }, 1000);

  const value: TickerMethods = {
    onEachSecond: (cb: (time?: number) => void) => createEffect(on(time, cb)),
    onEachDay: (cb: (tomorrow?: Date) => void) =>
      createEffect(on(tomorrow, cb)),
    tomorrow,
  };

  TickerContext.defaultValue = value;
  return (
    <TickerContext.Provider value={value}> {children} </TickerContext.Provider>
  );
};

export function useTicker() {
  return useContext(TickerContext);
}

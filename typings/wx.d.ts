declare const wx: any

type MiniProgramPageInstance<TData> = {
  data: TData
  setData(data: Partial<TData>): void
}

declare function Page<TData extends Record<string, any>, TOptions extends Record<string, any>>(
  options: TOptions & { data: TData } & ThisType<TOptions & MiniProgramPageInstance<TData>>
): void

declare function App<TOptions extends Record<string, any>>(
  options: TOptions & ThisType<TOptions>
): void

declare function getApp<T = Record<string, any>>(): T

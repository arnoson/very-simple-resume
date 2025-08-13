export type Selector = string

export type Page = Record<Selector, ElementState>

export type ElementState = {
  attributes?: Record<string, string>
  dataset?: Record<string, string>
  properties?: Record<string, any>
  scroll?: { top: number; left: number }
  focused?: boolean
}

export type MaybeFunction<Type> = Type | ((...args: any) => Type)

export type Rule = {
  selector: string
  properties?: MaybeFunction<string[] | undefined>
  attributes?: MaybeFunction<string[] | undefined>
  dataset?: MaybeFunction<string[] | undefined>
}

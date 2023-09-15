export default class SelectionAndValue {
  constructor(
    value: string | undefined,
    selectionStart: number | null | undefined,
    selectionEnd: number | null | undefined
  ) {
    this.#selectionEnd = selectionEnd;
    this.#selectionStart = selectionStart;
    this.#value = value;
  }

  #value: string | undefined;
  #selectionEnd: number | null | undefined;
  #selectionStart: number | null | undefined;

  get value(): string | undefined {
    return this.#value;
  }

  get selectionEnd(): number | null | undefined {
    return this.#selectionEnd;
  }

  get selectionStart(): number | null | undefined {
    return this.#selectionStart;
  }
}

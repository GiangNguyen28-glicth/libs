import { ValidationError, validateSync } from 'class-validator';

export const DEFAULT_CON_ID = 'default';

export class ClientConfig {
  conId: string;
  context: string;
  constructor(props: ClientConfig) {
    this.conId = props.conId;
    this.context = props.context;
  }

  validate(): string[] {
    const errors: ValidationError[] = validateSync(this);
    return errors.length
      ? errors.reduce(
          (res, err) => res.concat(Object.values(err.constraints)),
          [],
        )
      : null;
  }
}

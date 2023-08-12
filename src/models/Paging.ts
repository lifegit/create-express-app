import { IsNumber, Max, Min, validateSync } from 'class-validator';
import { createParamDecorator } from 'routing-controllers';

class Paging {
  @IsNumber()
  @Min(1)
  current;

  @IsNumber()
  @Max(60)
  pageSize;

  getPage = () => ({
    skip: (this.current - 1) * this.pageSize,
    take: this.pageSize,
  });

  result = (total: number, data: object[]) => ({
    current: this.current,
    pageSize: this.pageSize,
    total,
    data,
  });
}

export default Paging;

export function QueryPaging(options?: { required?: boolean }) {
  return createParamDecorator({
    required: options?.required ?? false,
    value: (action) => {
      const { current = 1, pageSize = 20 } = action.request.query;
      const paging = new Paging();
      paging.current = Number(current);
      paging.pageSize = Number(pageSize);

      const errors = validateSync(paging);
      if (errors.length > 0) {
        const { constraints = {} } = errors[0];
        const key = Object.keys(constraints);
        const err = new Error(constraints[key[0]].toString());
        err.name = 'Validation Failed';
        err.stack = '';
        throw err;
      }

      return paging;
    },
  });
}

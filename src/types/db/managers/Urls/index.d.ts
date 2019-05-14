import { Url } from '../../../../db/entity/Url.entity';

export as namespace Urls;
export = Urls;

declare class Urls {

  public find(id: string): Promise<Urls.ReturnValue>;

  public save(id: string, data: string): Promise<Urls.ReturnValue>;

}

declare namespace Urls {
  type ReturnValue = Url | undefined;
}

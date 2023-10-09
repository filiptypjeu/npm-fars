import { APIManager, FilterType, ListType, ListableEndpoints } from "json-endpoints";
import { API, IFarsUser, IGkey } from "./interfaces";

export class FARS extends APIManager<API> {
  constructor(options: { apiBaseUrl: string; username: string; password: string }) {
    super({
      ...options,
      endingBackslash: false,
    });
  }

  public override async getList<N extends ListableEndpoints<API>, FILTERS extends FilterType<API[N]>>(
    name: N,
    filters?: FILTERS | undefined
  ): Promise<ListType<API[N]>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (name !== "gkey") return super.getList(name, { format: "json", ...(filters || {}) } as any);
    const str = (await super.getList(name, filters)) as unknown as string;
    return str
      .split("\n")
      .filter(s => s)
      .map(s => {
        const [username, group, start, end, metadata, code] = s.split(":");
        const m = Number(metadata);
        const gkey: IGkey = {
          username,
          start_date: new Date(Number(start) * 1000),
          end_date: new Date(Number(end) * 1000),
          unlock_door: !!((m >> 2) & 1),
          restrict_keys: !!((m >> 1) & 1),
          disable_sauna_heating: !!(m & 1),
        };
        if (group !== "0") gkey.group_name = group;
        if (code !== "0") gkey.code = code;
        return gkey;
      }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  public static userToString = (user: IFarsUser): string => {
    const name = [user.first_name, user.last_name].join(" ").trim();

    if (name && user.username) {
      return `${name} (${user.username})`;
    }

    return [name, user.username].join(" ").trim();
  };

  public static encodeDate = (date: Date | string) => {
    let d = date;
    if (typeof d === "string") d = new Date(d);
    return d.toISOString();
  };
}

export default FARS;

import { FARS, IFarsUser } from "../index";
import variables from "./variables/fars.test_variables";

const fars = new FARS(variables);

test("getList bookables", async () => {
  const bookables = await fars.getList("bookables");
  for (const id_st of variables.bookables) {
    expect(bookables.find(b => b.id_str === id_st)?.id_str).toEqual(id_st);
  }
});

test("getList bookings", async () => {
  const bookables = await fars.getList("bookings");
  expect(bookables.count > 0).toBe(true);
});

test("getList gkey", async () => {
  const gkeys = await fars.getList("gkey");
  expect(gkeys.length > 0).toBe(true);
  const gkey = gkeys[0];
  expect(gkey.username).toBeDefined();
  expect(gkey.start_date.getFullYear()).toBeTruthy();
  expect(gkey.end_date.getFullYear()).toBeTruthy();
  expect([true, false].includes(gkey.unlock_door)).toBeTruthy();
  expect([true, false].includes(gkey.restrict_keys)).toBeTruthy();
  expect([true, false].includes(gkey.disable_sauna_heating)).toBeTruthy();
});

const { specific_case } = variables;
if (specific_case.run_this_test) {
  test("bookings specific", async () => {
    const result = await fars.getList("bookings", specific_case.query_parameters);
    expect(result.count).toEqual(1);
    expect(result.results[0]).toEqual(specific_case.result);
  }, 10000);
} else {
  console.warn("Skipping specific_case tests");
}

test("userToString", async () => {
  const user: IFarsUser = {
    first_name: "Firstname",
    last_name: "Lastname",
    username: "username123",
  };
  expect(FARS.userToString(user)).toEqual("Firstname Lastname (username123)");

  user.last_name = "";
  expect(FARS.userToString(user)).toEqual("Firstname (username123)");

  user.first_name = "";
  expect(FARS.userToString(user)).toEqual("username123");

  user.first_name = "First";
  user.last_name = "Last";
  user.username = "";
  expect(FARS.userToString(user)).toEqual("First Last");
});

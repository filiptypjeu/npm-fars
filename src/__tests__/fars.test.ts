import { FARSManager, IFarsBooking, IFarsUser } from "../index";
import variables from "./variables/fars.test_variables";

const { myBaseURL, myUsername, myPassword, myBookables, mySpecificCase } = variables;

const testBooking = (b: IFarsBooking) => {
  expect(b.id).toBeDefined();
  expect(b.booking_group).toBeDefined();
  expect(b.start).toBeDefined();
  expect(b.end).toBeDefined();
  expect(b.comment).toBeDefined();
  expect(b.bookable).toBeDefined();
  expect(b.repeatgroup).toBeDefined();
  expect(b.user).toBeDefined();
  expect(b.user.first_name).toBeDefined();
  expect(b.user.last_name).toBeDefined();
  expect(b.user.username).toBeDefined();
};

const testDateToday = (expected: Date, actual?: Date) => {
  expect(actual).toBeDefined();
  expect(expected.getFullYear()).toEqual(actual!.getFullYear());
  expect(expected.getMonth()).toEqual(actual!.getMonth());
  expect(expected.getDate()).toEqual(actual!.getDate());
};

const testDateNow = (expected: Date, actual?: Date) => {
  expect(actual).toBeDefined();
  testDateToday(expected, actual);
  expect(expected.getHours()).toEqual(actual!.getHours());
  expect(expected.getMinutes()).toEqual(actual!.getMinutes());
};

const testTimeMidnight = (actual?: Date) => {
  expect(actual).toBeDefined();
  expect(actual!.getHours()).toEqual(0);
  expect(actual!.getMinutes()).toEqual(0);
  expect(actual!.getSeconds()).toEqual(0);
  expect(actual!.getMilliseconds()).toEqual(0);
};

const testTimeAlmostMidnight = (actual?: Date) => {
  expect(actual).toBeDefined();
  expect(actual!.getHours()).toEqual(23);
  expect(actual!.getMinutes()).toEqual(59);
  expect(actual!.getSeconds()).toEqual(59);
  expect(actual!.getMilliseconds()).toEqual(999);
};

const fars = new FARSManager(myBaseURL, myUsername, myPassword);

test("bookings nourl", async () => {
  await expect(new FARSManager("", myUsername, myPassword).bookings()).rejects.toThrowError();
}, 5000);

test("getBookables", async () => {
  const bookables = await fars.getBookables();
  expect(bookables).toEqual(myBookables);
});

test("bookings wrong login", async () => {
  const bookables = await new FARSManager(myBaseURL, myUsername, "myPassword").bookings();
  expect(bookables).toEqual({ queryParameters: {}, result: [], url: `${myBaseURL}/api/bookings?format=json` });
}, 5000);

test("bookings bookables", async () => {
  for (const { id_str, id } of myBookables) {
    const a = await fars.bookings({ bookable: id_str });
    const booking = a.result[0];
    testBooking(booking);
    expect(booking.bookable).toEqual(id);
    expect(a.queryParameters).toEqual({ bookable: id_str });
    expect(a.url).toEqual(`${myBaseURL}/api/bookings?bookable=${id_str}&format=json`);
  }
}, 10000);

test("bookings from now positive", async () => {
  const d = new Date();
  const id_str = myBookables[0].id_str;
  const { queryParameters } = await fars.bookingsFromNow(10, { bookable: id_str });

  expect(queryParameters.bookable).toBe(id_str);

  testDateNow(d, queryParameters.after);
  d.setDate(d.getDate() + 10);
  testDateNow(d, queryParameters.before);
}, 10000);

test("bookings from now negative", async () => {
  const d = new Date();
  const id_str = myBookables[0].id_str;
  const { queryParameters } = await fars.bookingsFromNow(-10, { bookable: id_str });

  expect(queryParameters.bookable).toBe(id_str);

  testDateNow(d, queryParameters.before);
  d.setDate(d.getDate() - 10);
  testDateNow(d, queryParameters.after);
}, 10000);

test("bookings from now zero", async () => {
  const d = new Date();
  const id_str = myBookables[0].id_str;
  const { queryParameters } = await fars.bookingsFromNow(0, { bookable: id_str });

  expect(queryParameters.bookable).toBe(id_str);

  testDateNow(d, queryParameters.after);
  expect(queryParameters.after).toBeDefined();
  expect(queryParameters.before).toBeDefined();
  expect(queryParameters.after).toEqual(queryParameters.before);
}, 10000);

test("bookings from today positive", async () => {
  const d = new Date();
  const id_str = myBookables[0].id_str;
  const { queryParameters } = await fars.bookingsFromToday(10, { bookable: id_str });

  expect(queryParameters.bookable).toBe(id_str);

  testTimeMidnight(queryParameters.after!);
  testTimeAlmostMidnight(queryParameters.before!);

  testDateToday(d, queryParameters.after);
  d.setDate(d.getDate() + 10);
  testDateToday(d, queryParameters.before);
}, 10000);

test("bookings from today negative", async () => {
  const d = new Date();
  const id_str = myBookables[0].id_str;
  const { queryParameters } = await fars.bookingsFromToday(-10, { bookable: id_str });

  expect(queryParameters.bookable).toBe(id_str);

  testTimeMidnight(queryParameters.after);
  testTimeAlmostMidnight(queryParameters.before);

  testDateToday(d, queryParameters.before);
  d.setDate(d.getDate() - 10);
  testDateToday(d, queryParameters.after);
}, 10000);

test("bookings from today zero", async () => {
  const d = new Date();
  const id_str = myBookables[0].id_str;
  const { queryParameters } = await fars.bookingsFromToday(0, { bookable: id_str });

  expect(queryParameters.bookable).toBe(id_str);

  testTimeMidnight(queryParameters.after);
  testTimeAlmostMidnight(queryParameters.before);

  testDateToday(d, queryParameters.after);
  testDateToday(d, queryParameters.before);
}, 10000);

if (mySpecificCase.runThisTest) {
  test("bookings specific", async () => {
    const result = await fars.bookings(mySpecificCase.queryParameters);
    expect(result.result).toEqual(mySpecificCase.resultPage.results);
  }, 10000);
} else {
  console.warn("Skipping mySpecificCase tests");
}

test("toString user", async () => {
  const user: IFarsUser = {
    first_name: "Firstname",
    last_name: "Lastname",
    username: "username123",
  };
  expect(fars.toString(user)).toEqual("Firstname Lastname (username123)");

  user.last_name = "";
  expect(fars.toString(user)).toEqual("Firstname (username123)");

  user.first_name = "";
  expect(fars.toString(user)).toEqual("username123");

  user.first_name = "First";
  user.last_name = "Last";
  user.username = "";
  expect(fars.toString(user)).toEqual("First Last");
});

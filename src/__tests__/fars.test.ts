import { FARSManager, IFarsBooking } from "../index";
import { myBaseURL, myUsername, myPassword, myBookables, myBroadCases, mySpecificCase } from "./variables/fars.test_variables";

const testObject = (b: IFarsBooking) => {
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

const testDateToday = (expected: Date, provided: Date) => {
  expect(expected.getFullYear()).toEqual(provided.getFullYear());
  expect(expected.getMonth()).toEqual(provided.getMonth());
  expect(expected.getDate()).toEqual(provided.getDate());
}

const testDateNow = (expected: Date, provided: Date) => {
  testDateToday(expected, provided);
  expect(expected.getHours()).toEqual(provided.getHours());
  expect(expected.getMinutes()).toEqual(provided.getMinutes());
}

const testDateMidnight = (provided: Date) => {
  expect(provided.getHours()).toEqual(0);
  expect(provided.getMinutes()).toEqual(0);
  expect(provided.getSeconds()).toEqual(0);
  expect(provided.getMilliseconds()).toEqual(0);
}

const testDateAlmostMidnight = (provided: Date) => {
  expect(provided.getHours()).toEqual(23);
  expect(provided.getMinutes()).toEqual(59);
  expect(provided.getSeconds()).toEqual(59);
  expect(provided.getMilliseconds()).toEqual(999);
}

const fars = new FARSManager(myBaseURL, myUsername, myPassword);

test("bookings nourl", async () => {
  await expect(new FARSManager("", myUsername, myPassword).bookings()).rejects.toThrowError();
}, 5000);

if (myBroadCases.runThisTest) {
  test("bookings start", async () => {
    const a = await fars.bookings(myBroadCases.dateFrom, undefined, myBroadCases.bookable);
    testObject(a.result[0]);
    expect(a.bookable).toEqual(myBroadCases.bookable);
    expect(a.start).toEqual(myBroadCases.dateFrom);
    expect(a.end).toEqual(undefined);
  }, 10000);

  test("bookings end", async () => {
    const a = await fars.bookings(undefined, myBroadCases.dateTo, myBroadCases.bookable);
    testObject(a.result[0]);
    expect(a.bookable).toEqual(myBroadCases.bookable);
    expect(a.start).toEqual(undefined);
    expect(a.end).toEqual(myBroadCases.dateTo);
  }, 10000);

  test("bookings start and end", async () => {
    const a = await fars.bookings(myBroadCases.dateFrom, myBroadCases.dateTo, myBroadCases.bookable);
    testObject(a.result[0]);
    expect(a.bookable).toEqual(myBroadCases.bookable);
    expect(a.start).toEqual(myBroadCases.dateFrom);
    expect(a.end).toEqual(myBroadCases.dateTo);
  }, 10000);
}

test("bookings bookables", async () => {
  for (let bookable of myBookables) {
    const a = await fars.bookings(undefined, undefined, bookable);
    testObject(a.result[0]);
    expect(a.bookable).toEqual(bookable);
    expect(a.start).toEqual(undefined);
    expect(a.end).toEqual(undefined);
    expect(a.url).toEqual(`${myBaseURL}/api/bookings?bookable=${bookable}&after=&before=&format=json`);
  }
}, 10000);

test("bookings from now positive", async () => {
  const d = new Date();
  const a = await fars.bookingsFromNow(10, myBookables[0]);

  expect(a.bookable).toEqual(myBookables[0]);
  expect(a.start).toBeDefined();
  expect(a.end).toBeDefined();

  testDateNow(a.start!, d);
  d.setDate(d.getDate() + 10);
  testDateNow(a.end!, d);
}, 10000);

test("bookings from now negative", async () => {
  const d = new Date();
  const a = await fars.bookingsFromNow(-10, myBookables[0]);

  expect(a.bookable).toEqual(myBookables[0]);
  expect(a.start).toBeDefined();
  expect(a.end).toBeDefined();

  testDateNow(a.end!, d);
  d.setDate(d.getDate() - 10);
  testDateNow(a.start!, d);
}, 10000);

test("bookings from now zero", async () => {
  const d = new Date();
  const a = await fars.bookingsFromNow(0, myBookables[0]);

  expect(a.bookable).toEqual(myBookables[0]);
  expect(a.start).toBeDefined();
  expect(a.end).toBeDefined();

  testDateNow(a.start!, d);
  expect(a.start).toEqual(a.end);
}, 10000);

test("bookings from today positive", async () => {
  const d = new Date();
  const a = await fars.bookingsFromToday(10, myBookables[0]);

  expect(a.bookable).toEqual(myBookables[0]);
  expect(a.start).toBeDefined();
  expect(a.end).toBeDefined();

  testDateMidnight(a.start!);
  testDateAlmostMidnight(a.end!);

  testDateToday(a.start!, d);
  d.setDate(d.getDate() + 10);
  testDateToday(a.end!, d);
}, 10000);

test("bookings from today negative", async () => {
  const d = new Date();
  const a = await fars.bookingsFromToday(-10, myBookables[0]);

  expect(a.bookable).toEqual(myBookables[0]);
  expect(a.start).toBeDefined();
  expect(a.end).toBeDefined();

  testDateMidnight(a.start!);
  testDateAlmostMidnight(a.end!);

  testDateToday(a.end!, d);
  d.setDate(d.getDate() - 10);
  testDateToday(a.start!, d);
}, 10000);

test("bookings from today zero", async () => {
  const d = new Date();
  const a = await fars.bookingsFromToday(0, myBookables[0]);

  expect(a.bookable).toEqual(myBookables[0]);
  expect(a.start).toBeDefined();
  expect(a.end).toBeDefined();

  testDateMidnight(a.start!);
  testDateAlmostMidnight(a.end!);

  testDateToday(a.start!, d);
  testDateToday(a.end!, d);
}, 10000);

if (mySpecificCase.runThisTest) {
  test("bookings specific", async () => {
    if (!mySpecificCase.runThisTest) {
      return;
    }

    const a = await fars.bookings(mySpecificCase.parameters.dateFrom, mySpecificCase.parameters.dateTo, mySpecificCase.parameters.bookable);
    expect(a.result).toHaveLength(1);
    expect(a.result[0]).toEqual(mySpecificCase.result);
  }, 10000);
}

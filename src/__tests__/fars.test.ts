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

const fars = new FARSManager(myBaseURL, myUsername, myPassword);

test("bookings nourl", async () => {
  await expect(new FARSManager("", myUsername, myPassword).bookings()).rejects.toThrowError();
}, 5000);

if (myBroadCases.runThisTest) {
  test("bookings start", async () => {
    const a = await fars.bookings(myBroadCases.dateFrom, undefined, myBroadCases.bookable);
    testObject(a.result[0]);
  }, 10000);

  test("bookings end", async () => {
    const a = await fars.bookings(undefined, myBroadCases.dateTo, myBroadCases.bookable);
    testObject(a.result[0]);
  }, 10000);

  test("bookings start and end", async () => {
    const a = await fars.bookings(myBroadCases.dateFrom, myBroadCases.dateTo, myBroadCases.bookable);
    testObject(a.result[0]);
  }, 10000);
}

test("bookings bookables", async () => {
  for (let bookable of myBookables) {
    const a = await fars.bookings(undefined, undefined, bookable);
    testObject(a.result[0]);
  }
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

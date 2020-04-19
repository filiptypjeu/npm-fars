import { bookings, setFarsParams, IFarsBooking } from "../index";
import { myBaseURL, myUsername, myPassword, myTestparameters, myBookables } from "./variables/fars.test_variables";

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

test("bookings nourl", async () => {
  await expect(bookings()).rejects.toThrowError();
}, 5000);

test("setBadLoginPath", async () => {
  expect(setFarsParams(myBaseURL, myUsername, myPassword, "notcorrect")).toEqual(undefined);
}, 5000);

test("bookings bad login path", async () => {
  await expect(bookings()).rejects.toThrowError();
}, 5000);

test("setBadApiPath", async () => {
  expect(setFarsParams(myBaseURL, myUsername, myPassword, undefined, "notCorrect")).toEqual(undefined);
}, 5000);

test("bookings bad api path", async () => {
  await expect(bookings()).rejects.toThrowError();
}, 5000);

test("setFarsParams", async () => {
  expect(setFarsParams(myBaseURL, myUsername, myPassword)).toEqual(undefined);
}, 5000);

test("bookings", async () => {
  const a = await bookings();
  testObject(a.result[0]);
}, 10000);

test("bookings start", async () => {
  const a = await bookings(new Date("2019-10-01"));
  testObject(a.result[0]);
}, 10000);

test("bookings end", async () => {
  const a = await bookings(undefined, new Date("2019-10-01"));
  testObject(a.result[0]);
}, 10000);

test("bookings bookables", async () => {
  for (let bookable of myBookables) {
    const a = await bookings(undefined, undefined, bookable);
    testObject(a.result[0]);
  }
}, 10000);

test("bookings allparameters", async () => {
  for (let bookable of myBookables) {
    const a = await bookings(new Date("2019-01-01"), new Date("2019-12-31"), bookable);

    testObject(a.result[0]);
  }
}, 10000);

test("bookings specific", async () => {
  if (!myTestparameters.runThisTest) { return; }

  const a = await bookings(myTestparameters.dateFrom, myTestparameters.dateTo, myTestparameters.bookable);
  expect(a.result).toHaveLength(1);
  expect(a.result[0]).toEqual(myTestparameters.result);
}, 10000);

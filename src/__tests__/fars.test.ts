import { bookings, setURL, IFarsBooking } from '../index';
import { myBaseURL, myBookables, myTestparameters } from './variables/fars.test_variables';

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
}

test('bookings nourl', async () => {
  await expect(bookings()).rejects.toThrowError();
}, 10000);

test('setURL', async () => {
  expect(setURL(myBaseURL)).toEqual(myBaseURL);
}, 10000);

test('bookings', async () => {
  const a = await bookings();
  testObject(a[0]);
}, 10000);

test('bookings start', async () => {
  const a = await bookings(new Date("2019-10-01"));
  testObject(a[0]);
}, 10000);

test('bookings end', async () => {
  const a = await bookings(undefined, new Date("2019-10-01"));
  testObject(a[0]);
}, 10000);

test('bookings bookables', async () => {
  for (let bookable of myBookables) {
    const a = await bookings(undefined, undefined, bookable);
    if (a.length === 0) {
      console.log(bookable);
      console.log(a);
    }
    testObject(a[0]);
  }
});

test('bookings allparameters', async () => {
  for (let bookable of myBookables) {
    const a = await bookings(new Date("2019-01-01"), new Date("2019-12-31"), bookable);
    if (a.length === 0) {
      console.log(bookable);
      console.log(a);
    }
    testObject(a[0]);
  };
}, 10000);

test('bookings specific', async () => {
  const a = await bookings(myTestparameters.dateFrom, myTestparameters.dateTo, myTestparameters.bookable);
  expect(a).toHaveLength(1);
  expect(a[0]).toEqual(myTestparameters.result);
}, 10000);

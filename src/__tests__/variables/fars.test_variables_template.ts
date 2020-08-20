/**
 * URL for your FARS API.
 * String.
 */
export const myBaseURL = "";
export const myUsername = "";
export const myPassword = "";

/**
 * Your FARS bookables.
 * Array of strings.
 */
export const myBookables = ["myBookable1", "myBookable2"];

/**
 * Your test one test case.
 * Object containging search parameters and result.
 */
export const myTestparameters = {
  result: {
    id: 0,
    user: {
      username: "username",
      first_name: "first",
      last_name: "last",
    },
    booking_group: {
      name: "group",
    },
    start: "1970-01-01T01:00:00+02:00",
    end: "1970-01-01T02:00:00+02:00",
    comment: "comment",
    bookable: 1,
    repeatgroup: null,
  },
  dateFrom: new Date("1970-01-01T00:00:00+02:00"),
  dateTo: new Date("1970-01-02T00:00:00+02:00"),
  bookable: "myBookable1",
  runThisTest: true,
};

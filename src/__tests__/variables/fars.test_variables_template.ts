/**
 * Variables
 */
export const myBaseURL = "";
export const myUsername = "";
export const myPassword = "";

/**
 * Bookables
 */
export const myBookables = ["myBookable1", "myBookable2", "myBookable3"];

/**
 * Test broad cases, where the fetches gives at least 2 bookings.
 */
export const myBroadCases = {
  runThisTest: false,
  dateFrom: new Date("2020-01-01T00:00:00+02:00"),
  dateTo: new Date("2021-01-01T00:00:00+02:00"),
  bookable: "myBookable1",
};

/**
 * Test specific case, where the fetch only gets one result.
 */
export const mySpecificCase = {
  runThisTest: false,
  parameters: {
    dateFrom: new Date("2020-01-01T00:00:00+02:00"),
    dateTo: new Date("2020-01-02T00:00:00+02:00"),
    bookable: "myBookable1",
  },
  result: {
    id: 42,
    user: {
      username: "",
      first_name: "",
      last_name: "",
    },
    booking_group: null,
    start: "2020-01-01T00:00:00+02:00",
    end: "2020-01-02T00:00:00+02:00",
    comment: "",
    bookable: 1,
    repeatgroup: null,
  },
};

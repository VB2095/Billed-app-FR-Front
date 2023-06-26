/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { mockedBills } from "../__mocks__/store.js";
import { fireEvent } from "@testing-library/dom";

import { compareBillsByDate } from "../app/helpers.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      let classIcon = windowIcon.getAttribute("class");
      expect(classIcon).toContain("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const billData = bills;
      const sortedBills = billData.sort(compareBillsByDate);
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(datesSorted).toEqual(dates);
    });

    describe("When user click on icon eye", () => {
      test("then a modal should open", () => {
        document.body.innerHTML = BillsUI({ data: bills });
        const onNavigate = (pathname) => {
          const routeHtml = ROUTES({ pathname });
          document.body.innerHTML = routeHtml;
        };
        const html = BillsUI({ data: bills });
        document.body.innerHTML = html;
        const bill = new Bills({
          document,
          onNavigate,
          firestore: null,
          localStorage: window.localStorage,
        });
        const handleClickIconEye = jest.fn((e) => bill.handleClickIconEye(e));
        const eye = screen.getAllByTestId("icon-eye")[0];
        eye.addEventListener("click", handleClickIconEye);
        fireEvent.click(eye);
        expect(handleClickIconEye).toHaveBeenCalled();
        const modale = screen.getByTestId("#modaleFile");
        expect(modale).toBeTruthy();
      });
    });
    describe("When 'getBills' is called", () => {
      test("then it should fetch and format the bills from the store", async () => {
        // Mock the store and its bills() method
        const mockBills = [
          {
            id: "bill1",
            date: "2022-01-01",
            status: "pending",
          },
          {
            id: "bill2",
            date: "2022-02-01",
            status: "paid",
          },
        ];
        const mockBillsList = jest.fn().mockResolvedValue(mockBills);
        const mockStore = {
          bills: jest.fn(() => ({
            list: mockBillsList,
          })),
        };

        // Create an instance of Bills with the mock store
        const bills = new Bills({
          document,
          onNavigate,
          store: mockStore,
          localStorage,
        });

        // Call the getBills method and wait for the result
        const result = await bills.getBills();

        // Check if the store's bills().list() method was called
        expect(mockBillsList).toHaveBeenCalled();

        // Check if the bills are formatted correctly
        expect(result).toEqual([
          {
            id: "bill1",
            date: expect.any(String), // formatted date
            status: expect.any(String), // formatted status
          },
          {
            id: "bill2",
            date: expect.any(String), // formatted date
            status: expect.any(String), // formatted status
          },
        ]);
      });
    });
  });
});

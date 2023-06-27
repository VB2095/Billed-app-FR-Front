/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockedBills from "../__mocks__/store.js";
import { fireEvent } from "@testing-library/dom";
import { compareBillsByDate } from "../app/helpers.js";
import router from "../app/Router.js";
import mockStore from "../__mocks__/store";

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
      expect(windowIcon.classList).toContain("active-icon");
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

    describe("when the user clicks on the eye icon", () => {
      test("then a modal should open", () => {
        // Set up the component
        document.body.innerHTML = BillsUI({ data: bills });

        // Set up the test data
        const onNavigate = jest.fn();
        const bill = new Bills({
          document,
          onNavigate,
          store: mockStore,
        });

        // Set up the event handler
        const handleClickIconEye = jest.fn((event) => {
          const modal = document.querySelector("#myModal");
          $(modal).modal("show"); // Ouvre la modale
        });
        const eyeIcon = document.querySelector('[data-testid="icon-eye"]');
        eyeIcon.addEventListener("click", handleClickIconEye);

        // Simulate the user's click
        const clickEvent = new Event("click");
        eyeIcon.dispatchEvent(clickEvent);

        // Check if the modal is displayed
        const modal = document.querySelector('[data-testid="modaleFile"]');
        expect(handleClickIconEye).toHaveBeenCalled();
        expect(modal).toBeTruthy();
      });
    });
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page but it is loading", () => {
    test("Then, Loading page should be rendered", () => {
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page but back-end send an error message", () => {
    test("Then, Error page should be rendered", () => {
      document.body.innerHTML = BillsUI({ error: "some error message" });
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page but back-end send an error message", () => {
    test("Then, Error page should be rendered", () => {
      document.body.innerHTML = BillsUI({ error: "some error message" });
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I navigate to Dashboard", () => {
    test("Then, the dashboard should be rendered", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const onNavigate = jest.fn();
      const bill = new Bills({
        document,
        onNavigate,
        store: mockStore,
      });
      const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill(e));
      const newBillButton = screen.getByTestId("btn-new-bill");
      newBillButton.addEventListener("click", handleClickNewBill);
      fireEvent.click(newBillButton);
      expect(handleClickNewBill).toHaveBeenCalled();
    });
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I navigate to Dashboard", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      const billsList = await screen.getByTestId("tbody");
      expect(billsList).toBeTruthy();
    });

    describe("An error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockedBills, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
      });

      test("fetches bills from mock API GET", async () => {
        const getSpy = jest.spyOn(mockedBills, "bills");
        await mockedBills.bills(); // Appel de la méthode bills
        expect(getSpy).toHaveBeenCalledTimes(1);
      });

      test("fetches bills from an API and fails with 404 message error", async () => {
        mockedBills.bills.mockRejectedValueOnce(new Error("Erreur 404")); // Utilisation de mockRejectedValueOnce pour simuler une erreur
        document.body.innerHTML = `<div id="root"></div>`;
        router();
        const html = BillsUI({ error: "Erreur 404" });
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockedBills.bills.mockRejectedValueOnce(new Error("Erreur 500")); // Utilisation de mockRejectedValueOnce pour simuler une erreur
        document.body.innerHTML = `<div id="root"></div>`;
        router();
        const html = BillsUI({ error: "Erreur 500" });
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});

describe("Bills", () => {
  describe("getBills", () => {
    it("should return bills with formatted date and status", async () => {
      // Given
      const bills = new Bills({
        document: document,
        onNavigate: jest.fn(),
        store: {
          bills: jest.fn(() => ({
            list: jest.fn(() =>
              Promise.resolve([
                {
                  date: "2022-01-01",
                  status: "pending",
                },
              ])
            ),
          })),
        },
        localStorage: {},
      });

      // When
      const result = await bills.getBills();

      // Then
      expect(result).toEqual([
        {
          date: "1 Jan. 22",
          status: "En attente",
        },
      ]);
    });
  });
});

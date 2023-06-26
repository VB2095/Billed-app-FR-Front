/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
    });

    test("Then submitting the form without uploading a file should display an alert", () => {
      const onNavigate = jest.fn();
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      const form = screen.getByTestId("form-new-bill");
      const alertSpy = jest.spyOn(window, "alert");
      fireEvent.submit(form);
      expect(alertSpy).toHaveBeenCalledWith(
        "Veuillez ajouter une image au format jpg, jpeg ou png"
      );
      expect(onNavigate).not.toHaveBeenCalled();
    });

    test("Then submitting the form after uploading a file should update the bill and navigate to the Bills page", () => {
      const onNavigate = jest.fn();
      const store = {
        bills: () => ({
          create: jest.fn().mockResolvedValue({
            fileUrl: "https://example.com/image.jpg",
            key: "123456",
          }),
          update: jest.fn().mockResolvedValue({}),
        }),
      };
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      const form = screen.getByTestId("form-new-bill");
      const input = screen.getByTestId("file");
      const file = new File(["image"], "image.jpg", { type: "image/jpeg" });
      Object.defineProperty(input, "files", {
        value: [file],
      });
      fireEvent.change(input);
      fireEvent.submit(form);
      expect(store.bills().create).toHaveBeenCalledWith({
        data: expect.any(FormData),
        headers: {
          noContentType: true,
        },
      });
      expect(store.bills().update).toHaveBeenCalledWith({
        data: JSON.stringify({
          email: "employee@example.com",
          type: "Type",
          name: "Name",
          amount: 100,
          date: "2023-06-26",
          vat: "10",
          pct: 20,
          commentary: "Commentary",
          fileUrl: "https://example.com/image.jpg",
          fileName: "image.jpg",
          status: "pending",
        }),
        selector: "123456",
      });
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);
    });
  });
});

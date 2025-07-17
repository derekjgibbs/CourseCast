import { assert, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import { type Course, CourseCatalogDataTable } from "./table";

const mockCourses: Course[] = [
  {
    course_id: "CIS-121",
    title: "Data Structures & Algorithms",
    department: "OIDD",
    instructor: "G. Ive",
    days: "TR",
    start_time: "10:30",
    end_time: "12:00",
    credits: 1,
    price_forecast: 550,
  },
  {
    course_id: "MKTG-101",
    title: "Introduction to Marketing",
    department: "MKTG",
    instructor: "A. Gency",
    days: "MWF",
    start_time: "13:00",
    end_time: "14:00",
    credits: 0.5,
    price_forecast: 250,
  },
  {
    course_id: "ACCT-101",
    title: "Principles of Accounting",
    department: "ACCT",
    instructor: "C. Pah",
    days: "TR",
    start_time: "15:00",
    end_time: "16:30",
    credits: 1.5,
    price_forecast: 300,
  },
  {
    course_id: "FINC-100",
    title: "Corporate Finance",
    department: "FINC",
    instructor: "M. Money",
    days: "MW",
    start_time: "09:00",
    end_time: "10:30",
    credits: 1,
    price_forecast: 450,
  },
  {
    course_id: "BEPP-250",
    title: "Managerial Economics",
    department: "BEPP",
    instructor: "E. Conomist",
    days: "F",
    start_time: "12:00",
    end_time: "15:00",
    credits: 1,
    price_forecast: 150,
  },
];

describe("CourseCatalogDataTable", () => {
  it("should display 'No courses found' when no courses are provided", () => {
    render(<CourseCatalogDataTable courses={[]} />);
    expect(screen.getByText("No courses found")).toBeInTheDocument();
  });

  describe("pagination", () => {
    it("should paginate through the course catalog", async () => {
      const user = userEvent.setup();
      render(<CourseCatalogDataTable courses={mockCourses} initialPageSize={2} />);

      const getTableBodyRows = () => {
        const table = screen.getByRole("table");
        const tbody = table.querySelector("tbody");
        assert(tbody, "tbody should exist in table");
        return within(tbody).getAllByRole("row");
      };

      expect(getTableBodyRows()).toHaveLength(2);

      const [prevButton, nextButton] = screen.getAllByRole("button", { name: "" });
      assert(prevButton instanceof HTMLButtonElement);
      assert(nextButton instanceof HTMLButtonElement);

      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeEnabled();

      await user.click(nextButton);

      expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
      expect(getTableBodyRows()).toHaveLength(2);
      expect(prevButton).toBeEnabled();
      expect(nextButton).toBeEnabled();

      await user.click(nextButton);

      expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
      expect(getTableBodyRows()).toHaveLength(1);
      expect(prevButton).toBeEnabled();
      expect(nextButton).toBeDisabled();
    });
  });

  describe("sorting", () => {
    const getTableRows = () => {
      const table = screen.getByRole("table");
      const tbody = table.querySelector("tbody");
      assert(tbody, "tbody should exist in table");
      return within(tbody).getAllByRole("row");
    };
    const getCellContent = (row: HTMLElement, cellIndex: number) => {
      const cell = row.children[cellIndex];
      assert(cell);
      return cell.textContent;
    };

    it.each([
      { col: "Course ID", idx: 0, descendingFirst: false },
      { col: "Title", idx: 1, descendingFirst: false },
      { col: "Department", idx: 2, descendingFirst: false },
      { col: "Instructor", idx: 3, descendingFirst: false },
      { col: "Credits", idx: 5, descendingFirst: true },
      { col: "Price Forecast", idx: 6, descendingFirst: true },
    ])("should sort by $col on header click", async ({ col, idx, descendingFirst }) => {
      const user = userEvent.setup();
      render(<CourseCatalogDataTable courses={mockCourses} />);

      const headerButton = screen.getByRole("button", { name: new RegExp(col) });
      assert(headerButton instanceof HTMLButtonElement);

      await user.click(headerButton);
      let rows = getTableRows();
      let firstRowFirstCell = getCellContent(rows[0]!, idx);
      let lastRowFirstCell = getCellContent(rows[rows.length - 1]!, idx);
      assert(firstRowFirstCell);
      assert(lastRowFirstCell);
      expect(firstRowFirstCell.localeCompare(lastRowFirstCell)).toBe(descendingFirst ? 1 : -1);

      await user.click(headerButton);
      rows = getTableRows();
      firstRowFirstCell = getCellContent(rows[0]!, idx);
      lastRowFirstCell = getCellContent(rows[rows.length - 1]!, idx);
      assert(firstRowFirstCell);
      assert(lastRowFirstCell);
      expect(firstRowFirstCell.localeCompare(lastRowFirstCell)).toBe(descendingFirst ? -1 : 1);

      await user.click(headerButton);
      rows = getTableRows();
      const initialFirstCourseId = mockCourses[0]!.course_id;
      expect(getCellContent(rows[0]!, 0)).toBe(initialFirstCourseId);
    });
  });

  describe("filtering", () => {
    const getTableRows = () => {
      const table = screen.getByRole("table");
      const tbody = table.querySelector("tbody");
      assert(tbody, "tbody should exist in table");
      return within(tbody).getAllByRole("row");
    };

    it("should filter by Course ID", async () => {
      const user = userEvent.setup();
      render(<CourseCatalogDataTable courses={mockCourses} />);

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "Course ID" }));

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "CIS");

      const rows = getTableRows();
      expect(rows).toHaveLength(1);
      expect(rows[0]).toHaveTextContent("CIS-121");
    });

    it("should filter by Course Title", async () => {
      const user = userEvent.setup();
      render(<CourseCatalogDataTable courses={mockCourses} />);

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "Course Title" }));

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "intro");

      const rows = getTableRows();
      expect(rows).toHaveLength(1);
      expect(rows[0]).toHaveTextContent("Introduction to Marketing");
    });

    it("should clear search results when search input is cleared", async () => {
      const user = userEvent.setup();
      render(<CourseCatalogDataTable courses={mockCourses} />);

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "Course Title" }));

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "intro");

      const initialRows = getTableRows();
      expect(initialRows).toHaveLength(1);

      await user.clear(searchInput);
      const allRows = getTableRows();
      expect(allRows.length).toBeGreaterThan(1);
    });
  });
});

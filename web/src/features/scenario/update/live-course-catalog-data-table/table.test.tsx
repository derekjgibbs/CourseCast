import { assert, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import type { Course } from "@/lib/schema/course";

import { CourseCatalogDataTable } from "./table";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

// Time values are minutes from midnight (e.g., 10:30 = 10*60+30 = 630)
const mockCourses: Course[] = [
  {
    type: "regular",
    forecast_id: "CIS-121",
    term: 2024,
    semester: "Fall",
    department: "OIDD",
    section_code: "001",
    title: "Data Structures & Algorithms",
    instructors: ["G. Ive"],
    part_of_term: [],
    days_code: "TR",
    start_time: 630, // 10:30
    stop_time: 720, // 12:00
    credits: 1,
    capacity: 30,
    truncated_price_prediction: 550,
    price_prediction_residual_mean: 0,
    price_prediction_residual_std_dev: 50,
    truncated_price_fluctuations: [],
    conflict_groups: [],
  },
  {
    type: "regular",
    forecast_id: "MKTG-101",
    term: 2024,
    semester: "Fall",
    department: "MKTG",
    section_code: "001",
    title: "Introduction to Marketing",
    instructors: ["A. Gency"],
    part_of_term: [],
    days_code: "MWF",
    start_time: 780, // 13:00
    stop_time: 840, // 14:00
    credits: 0.5,
    capacity: 30,
    truncated_price_prediction: 250,
    price_prediction_residual_mean: 0,
    price_prediction_residual_std_dev: 25,
    truncated_price_fluctuations: [],
    conflict_groups: [],
  },
  {
    type: "regular",
    forecast_id: "ACCT-101",
    term: 2024,
    semester: "Fall",
    department: "ACCT",
    section_code: "001",
    title: "Principles of Accounting",
    instructors: ["C. Pah"],
    part_of_term: [],
    days_code: "TR",
    start_time: 900, // 15:00
    stop_time: 990, // 16:30
    credits: 1.5,
    capacity: 30,
    truncated_price_prediction: 300,
    price_prediction_residual_mean: 0,
    price_prediction_residual_std_dev: 30,
    truncated_price_fluctuations: [],
    conflict_groups: [],
  },
  {
    type: "regular",
    forecast_id: "FINC-100",
    term: 2024,
    semester: "Fall",
    department: "FINC",
    section_code: "001",
    title: "Corporate Finance",
    instructors: ["M. Money"],
    part_of_term: [],
    days_code: "MW",
    start_time: 540, // 09:00
    stop_time: 630, // 10:30
    credits: 1,
    capacity: 30,
    truncated_price_prediction: 450,
    price_prediction_residual_mean: 0,
    price_prediction_residual_std_dev: 45,
    truncated_price_fluctuations: [],
    conflict_groups: [],
  },
  {
    type: "regular",
    forecast_id: "BEPP-250",
    term: 2024,
    semester: "Fall",
    department: "BEPP",
    section_code: "001",
    title: "Managerial Economics",
    instructors: ["E. Conomist"],
    part_of_term: [],
    days_code: "F",
    start_time: 720, // 12:00
    stop_time: 900, // 15:00
    credits: 1,
    capacity: 30,
    truncated_price_prediction: 150,
    price_prediction_residual_mean: 0,
    price_prediction_residual_std_dev: 15,
    truncated_price_fluctuations: [],
    conflict_groups: [],
  },
];

describe("CourseCatalogDataTable", () => {
  it("should display 'No courses found' when no courses are provided", () => {
    const onCourseSelected = vi.fn();
    render(<CourseCatalogDataTable courses={[]} onCourseSelected={onCourseSelected} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText("No courses found")).toBeInTheDocument();
  });

  describe("pagination", () => {
    it("should paginate through the course catalog", async () => {
      const user = userEvent.setup();
      const onCourseSelected = vi.fn();
      render(
        <CourseCatalogDataTable
          courses={mockCourses}
          initialPageSize={2}
          onCourseSelected={onCourseSelected}
        />,
        { wrapper: createWrapper() },
      );

      const getTableBodyRows = () => {
        const table = screen.getByRole("table");
        const tbody = table.querySelector("tbody");
        assert(tbody, "tbody should exist in table");
        return within(tbody).getAllByRole("row");
      };

      expect(getTableBodyRows()).toHaveLength(2);

      // Find pagination buttons by locating the container with "Page X of Y"
      const pageIndicator = screen.getByText("Page 1 of 3");
      const paginationContainer = pageIndicator.parentElement;
      assert(paginationContainer, "pagination container should exist");
      const paginationButtons = within(paginationContainer).getAllByRole("button");
      assert(paginationButtons.length === 2, "should have 2 pagination buttons");
      const [prevButton, nextButton] = paginationButtons;
      assert(prevButton instanceof HTMLButtonElement);
      assert(nextButton instanceof HTMLButtonElement);

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

    // Column order: selected (0), Section (1), Title (2), Department (3), Instructor (4), Schedule (5), Credits (6), Price Forecast (7)
    // Note: Section is pre-sorted ascending by initialState, which affects toggle cycle (asc -> desc -> unsorted -> asc)
    // so Section is excluded from this test since it has different behavior than other columns
    it.each([
      { col: "Title", idx: 2, descendingFirst: false },
      { col: "Department", idx: 3, descendingFirst: false },
      { col: "Instructor", idx: 4, descendingFirst: true }, // Array sorting behavior
      { col: "Credits", idx: 6, descendingFirst: true },
      { col: "Price Forecast", idx: 7, descendingFirst: true },
    ])("should sort by '$col' on header click", async ({ col, idx, descendingFirst }) => {
      const user = userEvent.setup();
      const onCourseSelected = vi.fn();
      render(<CourseCatalogDataTable courses={mockCourses} onCourseSelected={onCourseSelected} />, {
        wrapper: createWrapper(),
      });

      const headerButton = screen.getByRole("button", { name: new RegExp(col) });
      assert(headerButton instanceof HTMLButtonElement);

      await user.click(headerButton);
      let rows = getTableRows();
      let firstRowCell = getCellContent(rows[0]!, idx);
      let lastRowCell = getCellContent(rows[rows.length - 1]!, idx);
      assert(firstRowCell);
      assert(lastRowCell);
      expect(firstRowCell.localeCompare(lastRowCell)).toBe(descendingFirst ? 1 : -1);

      await user.click(headerButton);
      rows = getTableRows();
      firstRowCell = getCellContent(rows[0]!, idx);
      lastRowCell = getCellContent(rows[rows.length - 1]!, idx);
      assert(firstRowCell);
      assert(lastRowCell);
      expect(firstRowCell.localeCompare(lastRowCell)).toBe(descendingFirst ? -1 : 1);

      await user.click(headerButton);
      rows = getTableRows();
      const initialFirstForecastId = mockCourses[0]!.forecast_id;
      expect(getCellContent(rows[0]!, 1)).toContain(initialFirstForecastId);
    });
  });

  describe("filtering", () => {
    const getTableRows = () => {
      const table = screen.getByRole("table");
      const tbody = table.querySelector("tbody");
      assert(tbody, "tbody should exist in table");
      return within(tbody).getAllByRole("row");
    };

    it("should filter by Section ID", async () => {
      const user = userEvent.setup();
      const onCourseSelected = vi.fn();
      render(<CourseCatalogDataTable courses={mockCourses} onCourseSelected={onCourseSelected} />, {
        wrapper: createWrapper(),
      });

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "CIS");

      const rows = getTableRows();
      expect(rows).toHaveLength(1);
      expect(rows[0]).toHaveTextContent("CIS-121");
    });

    it("should filter by Course Title", async () => {
      const user = userEvent.setup();
      const onCourseSelected = vi.fn();
      render(<CourseCatalogDataTable courses={mockCourses} onCourseSelected={onCourseSelected} />, {
        wrapper: createWrapper(),
      });

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "intro");

      const rows = getTableRows();
      expect(rows).toHaveLength(1);
      expect(rows[0]).toHaveTextContent("Introduction to Marketing");
    });

    it("should clear search results when search input is cleared", async () => {
      const user = userEvent.setup();
      const onCourseSelected = vi.fn();
      render(<CourseCatalogDataTable courses={mockCourses} onCourseSelected={onCourseSelected} />, {
        wrapper: createWrapper(),
      });

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

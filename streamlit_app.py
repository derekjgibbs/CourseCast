import streamlit as st
import pandas as pd
from coursematch_solver import CourseMatchSolver
from montecarlo import MonteCarloSimulator
import random

st.set_page_config(
    page_title="Wharton CourseCast",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={"About": "Wharton CourseCast - Course Planning & Optimization Tool"},
)

st.markdown(
    """
    <meta name="description" content="Wharton CourseCast - Course Planning & Optimization Tool. Use Wharton CourseCast to plan your courses for the upcoming semester with up-to-date course information, professor evaluations, and more.">
    """,
    unsafe_allow_html=True,
)

# Initialize session state if needed
if "utility_data" not in st.session_state:
    # Load the data
    df = pd.read_excel("data_spring_2025.xlsx")
    df["department"] = df["primary_section_id"].str[:4]
    df["quarter"] = df["part_of_term"].map(
        {3: "Q3", 4: "Q4", "S": "Full", "Modular": "Block"}
    )

    # Add Utility column
    df.insert(0, "Utility", 0)
    st.session_state.utility_data = df

# Add sidebar
with st.sidebar:
    st.title("Budget and CUs")

    # Add numeric inputs
    tokens = st.number_input(
        "Number of Tokens",
        min_value=3000,
        max_value=7000,
        value=4500,  # default value
        step=50,
        help="Set your token allocation",
    )
    # Add credit input
    max_credits = st.number_input(
        "Maximum Credit Units",
        min_value=0.5,
        max_value=7.5,
        value=5.0,  # default value
        step=0.5,
        help="Set your maximum credit units",
    )

    # Add a run button to the sidebar
    if st.sidebar.button("Forecast Schedule (1x)", type="primary"):
        # Check if there are any courses with utility > 0
        courses_with_utility = st.session_state.utility_data[
            st.session_state.utility_data["Utility"] > 0
        ]

        if len(courses_with_utility) == 0:
            st.sidebar.error(
                "Please add utility values to at least one course and click 'Save Utility Values' before running the solver."
            )
        else:
            # Generate random seed
            random_seed = random.randint(1, 100)

            # Create the solver input message
            solver_input = {
                "budget": tokens,
                "max_credits": max_credits,
                "seed": random_seed,  # Use random seed
                "courses": [
                    {"uniqueid": row["uniqueid"], "utility": row["Utility"]}
                    for _, row in courses_with_utility.iterrows()
                ],
            }

            # For debugging - you can remove this later
            # st.sidebar.write("Solver Input:")
            # st.sidebar.json(solver_input)

            # TODO: Call your solver function here
            # result = solve_optimization(solver_input)
            # Create CourseMatchSolver instance and solve
            try:
                cms = CourseMatchSolver("data_spring_2025.xlsx", solver_input)
                selected = cms.solve()

                # Store current results before updating
                if "solver_results" in st.session_state:
                    # Get the previous metrics
                    prev_mask = st.session_state.utility_data["uniqueid"].isin(
                        [item["uniqueid"] for item in st.session_state.solver_results]
                    )
                    prev_selected = st.session_state.utility_data[prev_mask]

                    st.session_state.prev_metrics = {
                        "credits": prev_selected["credit_unit"].sum(),
                        "price": prev_selected["price_predicted"].sum(),
                        "weighted_utility": (
                            prev_selected["Utility"] * prev_selected["credit_unit"]
                        ).sum(),
                    }

                # Store new results
                st.session_state.solver_results = selected
                st.session_state.selected_uniqueids = [
                    item["uniqueid"] for item in selected
                ]

                st.sidebar.success(
                    "✨ Optimization complete! Click 'Schedule Forecast' tab to view your schedule."
                )

            except Exception as e:
                import traceback

                st.sidebar.error(f"Error running solver: {str(e)}")
                st.sidebar.error("Full error trace:")
                st.sidebar.code(traceback.format_exc())

    # Add Monte Carlo button to the sidebar
    if st.sidebar.button("Simulate Schedule (100x)", type="primary"):
        # Check if there are any courses with utility > 0
        courses_with_utility = st.session_state.utility_data[
            st.session_state.utility_data["Utility"] > 0
        ]

        if len(courses_with_utility) == 0:
            st.sidebar.error(
                "Please add utility values to at least one course and click 'Save Utility Values' before running the solver."
            )
        else:
            # Create the solver input message
            solver_input = {
                "budget": tokens,
                "max_credits": max_credits,
                "courses": [
                    {"uniqueid": row["uniqueid"], "utility": row["Utility"]}
                    for _, row in courses_with_utility.iterrows()
                ],
            }

            try:
                # Create simulator and run
                simulator = MonteCarloSimulator("data_spring_2025.xlsx")

                # Add progress bar in sidebar
                progress_bar = st.sidebar.progress(0)

                def update_progress(current, total):
                    progress_bar.progress(current / total)

                results = simulator.run_simulation(
                    base_input=solver_input,
                    num_simulations=50,
                    callback=update_progress,
                )

                # Clear progress bar
                progress_bar.empty()

                # Store results in session state
                st.session_state.monte_carlo_results = results
                st.sidebar.success(
                    "🎲 Simulation complete! Click 'Schedule Simulation' tab to view the analysis."
                )

            except Exception as e:
                import traceback

                st.sidebar.error(f"Error running simulation: {str(e)}")
                st.sidebar.error("Full error trace:")
                st.sidebar.code(traceback.format_exc())

    # Add table showing courses being passed to forecaster
    st.write("### Current Course Inputs")
    courses_with_utility = st.session_state.utility_data[
        st.session_state.utility_data["Utility"] > 0
    ]

    if len(courses_with_utility) > 0:
        solver_input_courses = [
            {"Course": row["primary_section_id"], "Utility": row["Utility"]}
            for _, row in courses_with_utility.iterrows()
        ]

        st.dataframe(
            solver_input_courses,
            column_config={
                "Course": st.column_config.TextColumn("Course", width="small"),
                "Utility": st.column_config.NumberColumn(
                    "Utility", width="small", format="%d"
                ),
            },
            hide_index=True,
            use_container_width=True,
        )

        # Add clear button
        if st.button("🗑️ Clear All Utility Values"):
            # Reset all utility values to 0
            st.session_state.utility_data["Utility"] = 0
            st.rerun()
    else:
        st.info("No courses with saved utility")

    st.divider()

    # Add download button at the bottom of sidebar
    with open("data_spring_2025.xlsx", "rb") as file:
        st.download_button(
            label="Download Coursebook (XLSX)",
            icon="📥",
            data=file,
            file_name="data_spring_2025.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            help="Download the complete course dataset as an Excel file",
            use_container_width=True,
        )

st.title("CourseCast v1.0")

with st.expander("⭐️ **CLICK ME! LEARN HOW TO USE THIS TOOL!** ⭐️"):
    st.markdown(
        """
    #### A Note from Derek

    Hi there! I built this tool to help you (and me) get more out of CourseMatch.
    CourseMatch is a powerful system that tries very hard to give you what it thinks you want, based on the utilities you provide.
    The problem is that it's hard to translate what you want into the right utility values.
    You might end up with disappointing schedules simply because you didn't speak the CourseMatch "language" correctly.
    This tool is designed to help bridge that gap. By showing you potential schedules,
    CourseCast helps you build better intuition about how utility values translate to actual results.
    And unlike the "Top Schedules" tab in CourseMatch, this tool actually accounts for prices and variability.

    I hope this tool helps. Life is too short for crappy class schedules. Happy CourseCasting!

    --- Derek Gibbs (12/4/24)

    P.S. While this application works on mobile, I recommend using a desktop for a better experience.
    Also, huge thanks to Owen Kwon for his help in building this!
    If you have any feedback or find any bugs, please let me know via email at djgibbs@wharton.upenn.edu.

    ### CourseCast in a Nutshell

    In short, CourseCast does five things:
    1. Allows you to browse and filter course information
    2. Allows you tso assign utility values to courses
    3. Generates a price forecast based on historical data + uncertainty
    4. Solves the optimal schedule given prices, utility values, and constraints
    5. Simulates the schedule many times to see the probability of different outcomes

    As with any forecast, **none of the results are guaranteed**.
    But it might help you get a sense of what's possible.

    #### 1. Initial Setup
    **Configure Your Parameters**
       - Access the sidebar by clicking the button in the top right corner
       - Set your token budget (3000-5500)
       - Set maximum credit units (3.0-7.5)

    #### 2. Course Selection Process
    **Browse & Filter Courses**
       - Access the Course Browser by clicking the 'Course Browser' tab
       - Use the search bar for keyword search across all fields
       - Use dropdown filters for Department, Instructor, Days, Time, Credits, and Quarter
       - View course evaluation data including course quality, instructor ratings, difficulty, and workload
       - Click any column header to sort the table (ascending, descending, none)

    **Assign Utility Values**
       - **[Recommended]** Input a generic utility value for each course you're interested in (ex: 50)
       - **[Recommended]** Click 'Save Utility Values' to preserve your changes (*Warning: Any filter changes will wipe unsaved utilities!*)
       - **[Recommended]** Use 'Hide Zero Utility' to focus on courses you've rated
       - Enter refined utility values (0-100) for courses
       - Click 'Save Utility Values' to preserve your changes
       - **Important**: At least one course must have a utility > 0 to run the optimizer

    #### 3. Running Optimizations
    **Single Optimization**
       - Click 'Forecast Schedule (1x)' in the sidebar to see a potential schedule (based on a random roll of the dice)
       - Access the 'Schedule Forecast' tab to view results
       - View forecasted schedule's courses, total credits, total price, and weighted utility
       - **[Recommended]** Click 'Forecast Schedule (1x)' multiple times to see different potential schedules

    **Monte Carlo Simulation**
       - Click 'Simulate Schedule (100x)' in the sidebar to see class and schedule probabilities (*Note: It may take a few seconds to run*)
       - Access the 'Schedule Simulation' tab to view results
       - View individual course probabilities (# of times course appears in schedule / # of simulations)
       - View top 3 most common schedules (# of times complete schedule appears / # of simulations)

    #### Tips
    - Save your utility values frequently
    - Experiment with different utility values and examine schedule outcomes
    - Make sure to add enough courses that don't occupy the same timeslots
    """
    )

# Create tabs right after the title and welcome message
tab1, tab2, tab3 = st.tabs(
    ["Course Browser", "Schedule Forecast", "Schedule Simulation"]
)

# Move into tab1 (removing the welcome message since it's now above)
with tab1:
    st.header("Course Information")
    st.write(
        """
                1. Use the table and filters below to browse the course and evaluation data (downloadable as CSV with button in upper right of table).
                2. Input utility values and click the 'Save Utility Values' button below the table to preserve your changes.
                3. Run the schedule forecaster by clicking 'Forecast Schedule (1x)' or 'Simulate Schedule (100x)' in the sidebar.
    """
    )

    # Initialize filter states if needed
    if "filters" not in st.session_state:
        st.session_state.filters = {
            "search": "",
            "department": "All",
            "instructor": "All",
            "days": "All",
            "time": "All",
            "credits": "All",
            "quarter": "All",
            "hide_zero": False,
            "min_course_quality": 0.0,
            "min_instructor_quality": 0.0,
            "max_difficulty": 4.0,
            "max_workload": 4.0,
        }

    # Add search box
    search = st.text_input(
        "Search",
        value=st.session_state.filters["search"],
        placeholder="Search",
        key="search",
    )
    st.session_state.filters["search"] = search

    # Single row of filters with columns
    filter_row = st.columns([3, 3, 1, 2, 1, 1, 2])

    with filter_row[0]:
        departments = ["All"] + sorted(
            st.session_state.utility_data["department"].unique().tolist()
        )
        selected_dept = st.selectbox("Department", departments, key="dept_select")
        st.session_state.filters["department"] = selected_dept

    with filter_row[1]:
        instructors = ["All"] + sorted(
            st.session_state.utility_data["instructor"].unique().tolist()
        )
        selected_instructor = st.selectbox(
            "Instructor", instructors, key="instructor_select"
        )
        st.session_state.filters["instructor"] = selected_instructor

    with filter_row[2]:
        days = ["All"] + sorted(
            st.session_state.utility_data["days_code"].unique().tolist()
        )
        selected_day = st.selectbox("Day", days, key="day_select")
        st.session_state.filters["days"] = selected_day

    with filter_row[3]:
        times_24hr = sorted(
            st.session_state.utility_data["start_time_24hr"].unique().tolist()
        )
        times_12hr = ["All"] + [t.strftime("%-I:%M %p") for t in times_24hr]
        times_dict = dict(zip(times_12hr[1:], times_24hr))

        selected_time_12hr = st.selectbox("Time", times_12hr, key="time_select")
        selected_time = times_dict.get(selected_time_12hr, "All")
        st.session_state.filters["time"] = selected_time

    with filter_row[4]:
        credits = ["All", "0.5", "1.0"]
        selected_credits = st.selectbox("CU", credits, key="credits_select")
        st.session_state.filters["credits"] = selected_credits

    with filter_row[5]:
        quarters = ["All", "Q3", "Q4", "Full", "Block"]
        selected_quarter = st.selectbox("Qtr", quarters, key="quarter_select")
        st.session_state.filters["quarter"] = selected_quarter

    with filter_row[6]:
        st.write("")  # Empty label for spacing
        hide_zero = st.checkbox(
            "Hide Zero Utility", key="hide_zero_select", label_visibility="visible"
        )
        st.session_state.filters["hide_zero"] = hide_zero

    eval_cols = st.columns(4)

    with eval_cols[0]:
        min_course_quality = st.number_input(
            "Min Course Quality",
            min_value=0.0,
            max_value=4.0,
            value=0.0,
            step=0.1,
            key="min_course_quality",
        )
        st.session_state.filters["min_course_quality"] = min_course_quality

    with eval_cols[1]:
        min_instructor_quality = st.number_input(
            "Min Instructor Quality",
            min_value=0.0,
            max_value=4.0,
            value=0.0,
            step=0.1,
            key="min_instructor_quality",
        )
        st.session_state.filters["min_instructor_quality"] = min_instructor_quality

    with eval_cols[2]:
        max_difficulty = st.number_input(
            "Max Difficulty",
            min_value=0.0,
            max_value=4.0,
            value=4.0,
            step=0.1,
            key="max_difficulty",
        )
        st.session_state.filters["max_difficulty"] = max_difficulty

    with eval_cols[3]:
        max_workload = st.number_input(
            "Max Workload",
            min_value=0.0,
            max_value=4.0,
            value=4.0,
            step=0.1,
            key="max_workload",
        )
        st.session_state.filters["max_workload"] = max_workload

    # Modify the DataFrame columns based on toggle
    display_columns = [
        "Utility",
        "primary_section_id",
        "title",
        "days_code",
        "start_time_24hr",
        "stop_time_24hr",
        "quarter",
        "instructor",
        "credit_unit",
        "price_predicted",
        "overall_course_quality",
        "overall_instructor_quality",
        "overall_difficulty",
        "overall_work_required",
        "instructor_1_course_quality",
        "instructor_1_quality",
        "instructor_1_difficulty",
        "instructor_1_work_required",
        "instructor_2_course_quality",
        "instructor_2_quality",
        "instructor_2_difficulty",
        "instructor_2_work_required",
        "instructor_3_course_quality",
        "instructor_3_quality",
        "instructor_3_difficulty",
        "instructor_3_work_required",
    ]

    # Apply filters to the session state data
    filtered_data = st.session_state.utility_data.copy()
    if selected_dept != "All":
        filtered_data = filtered_data[filtered_data["department"] == selected_dept]
    if selected_instructor != "All":
        filtered_data = filtered_data[
            filtered_data["instructor"] == selected_instructor
        ]
    if "All" not in selected_day:
        filtered_data = filtered_data[filtered_data["days_code"].isin(selected_day)]
    if selected_time_12hr != "All":
        filtered_data = filtered_data[filtered_data["start_time_24hr"] == selected_time]
    if selected_credits != "All":
        filtered_data = filtered_data[
            filtered_data["credit_unit"] == float(selected_credits)
        ]
    if "All" not in selected_quarter:
        filtered_data = filtered_data[filtered_data["quarter"].isin(selected_quarter)]
    if search:
        filtered_data = filtered_data[
            filtered_data.astype(str)
            .apply(lambda x: x.str.contains(search, case=False))
            .any(axis=1)
        ]
    if hide_zero:
        filtered_data = filtered_data[filtered_data["Utility"] > 0]
    if min_course_quality > 0:
        filtered_data = filtered_data[
            filtered_data["overall_course_quality"] >= min_course_quality
        ]
    if min_instructor_quality > 0:
        filtered_data = filtered_data[
            filtered_data["overall_instructor_quality"] >= min_instructor_quality
        ]
    if max_difficulty < 4:
        filtered_data = filtered_data[
            filtered_data["overall_difficulty"] <= max_difficulty
        ]
    if max_workload < 4:
        filtered_data = filtered_data[
            filtered_data["overall_work_required"] <= max_workload
        ]

    # Display the edited data frame
    edited_df = st.data_editor(
        filtered_data[display_columns],
        key="course_editor",
        column_config={
            "Utility": st.column_config.NumberColumn(
                "Utility", min_value=0, max_value=100, step=1, default=0, width="small"
            ),
            "primary_section_id": st.column_config.TextColumn(
                "Course", width="none", disabled=True
            ),
            "title": st.column_config.TextColumn("Title", width="none", disabled=True),
            "days_code": st.column_config.TextColumn(
                "Days", width="none", disabled=True
            ),
            "start_time_24hr": st.column_config.TimeColumn(
                "Start",
                width="none",
                disabled=True,
                format="h:mm a",  # This will format like "9:30 AM"
            ),
            "stop_time_24hr": st.column_config.TimeColumn(
                "End", width="none", disabled=True, format="h:mm a"
            ),
            "quarter": st.column_config.TextColumn("Term", width="none", disabled=True),
            "instructor": st.column_config.TextColumn(
                "Instructor", width="none", disabled=True
            ),
            "credit_unit": st.column_config.NumberColumn(
                "CU", width="none", disabled=True
            ),
            "price_predicted": st.column_config.NumberColumn(
                "Forecast Price", width="none", disabled=True, format="%d"
            ),
            "overall_course_quality": st.column_config.NumberColumn(
                "Course Quality", width="none", disabled=True
            ),
            "overall_instructor_quality": st.column_config.NumberColumn(
                "Instr. Quality", width="none", disabled=True
            ),
            "overall_difficulty": st.column_config.NumberColumn(
                "Difficulty", width="none", disabled=True
            ),
            "overall_work_required": st.column_config.NumberColumn(
                "Work Required", width="none", disabled=True
            ),
            "instructor_1_course_quality": st.column_config.NumberColumn(
                "Instr. 1 Course", width="none", disabled=True
            ),
            "instructor_1_quality": st.column_config.NumberColumn(
                "Instr. 1 Quality", width="none", disabled=True
            ),
            "instructor_1_difficulty": st.column_config.NumberColumn(
                "Instr. 1 Difficulty", width="none", disabled=True
            ),
            "instructor_1_work_required": st.column_config.NumberColumn(
                "Instr. 1 Work", width="none", disabled=True
            ),
            "instructor_2_course_quality": st.column_config.NumberColumn(
                "Instr. 2 Course", width="none", disabled=True
            ),
            "instructor_2_quality": st.column_config.NumberColumn(
                "Instr. 2 Quality", width="none", disabled=True
            ),
            "instructor_2_difficulty": st.column_config.NumberColumn(
                "Instr. 2 Difficulty", width="none", disabled=True
            ),
            "instructor_2_work_required": st.column_config.NumberColumn(
                "Instr. 2 Work", width="none", disabled=True
            ),
            "instructor_3_course_quality": st.column_config.NumberColumn(
                "Instr. 3 Course", width="none", disabled=True
            ),
            "instructor_3_quality": st.column_config.NumberColumn(
                "Instr. 3 Quality", width="none", disabled=True
            ),
            "instructor_3_difficulty": st.column_config.NumberColumn(
                "Instr. 3 Difficulty", width="none", disabled=True
            ),
            "instructor_3_work_required": st.column_config.NumberColumn(
                "Instr. 3 Work", width="none", disabled=True
            ),
        },
        hide_index=True,
        use_container_width=True,
    )

    # Add a save button
    if st.button(
        "**SAVE UTILITY VALUES!** *YOU MUST SAVE UTILITY VALUES BEFORE CHANGING FILTERS OR YOU WILL LOSE YOUR PROGRESS!*",
        type="primary",
        use_container_width=True,
        icon="💾",
    ):
        if edited_df is not None:
            utility_updates = edited_df.set_index("primary_section_id")["Utility"]
            mask = st.session_state.utility_data["primary_section_id"].isin(
                utility_updates.index
            )
            st.session_state.utility_data.loc[mask, "Utility"] = (
                st.session_state.utility_data.loc[mask, "primary_section_id"].map(
                    utility_updates
                )
            )
            # Store a flag to show success message after rerun
            st.session_state.show_save_success = True
            st.rerun()

    # Show success message if flag is set
    if "show_save_success" in st.session_state and st.session_state.show_save_success:
        st.success("Utility values saved successfully!", icon="✅")
        # Clear the flag
        del st.session_state.show_save_success

with tab2:
    st.header("Forecasted Schedule")
    st.write(
        """
        This schedule represents an optimized solution based on:
        - Your assigned utility values
        - Token budget constraints
        - Maximum credit unit limits
        - Course time conflicts and other logistical constraints

        The displayed prices are estimates generated from a ML model
        trained on historical clearing price data. While these forecasts incorporate forecast
        uncertainty, actual clearing prices may vary.

        Use this forecast as a planning tool, not as a guarantee of your final schedule.
        **I recommend re-running the 'Forecast Schedule (1x)' multiple times to see how your schedule may change.**
    """
    )

    st.write("")

    # Check if we have results to display
    if (
        "selected_uniqueids" not in st.session_state
        or not st.session_state.selected_uniqueids
    ):
        st.info(
            "Click 'Forecast Schedule (1x)' in the sidebar to see optimization results here."
        )
    else:
        # First, create a dictionary of uniqueid -> price from solver results
        solver_prices = {
            item["uniqueid"]: item["price"] for item in st.session_state.solver_results
        }

        # Get the full information for selected courses
        mask = st.session_state.utility_data["uniqueid"].isin(
            st.session_state.selected_uniqueids
        )
        selected_courses = st.session_state.utility_data[mask]

        # Update prices with solver prices
        selected_courses["price_predicted"] = selected_courses["uniqueid"].map(
            solver_prices
        )

        st.dataframe(
            selected_courses[
                [
                    "primary_section_id",
                    "title",
                    "days_code",
                    "start_time_24hr",
                    "stop_time_24hr",
                    "quarter",
                    "instructor",
                    "credit_unit",
                    "price_predicted",
                    "Utility",
                ]
            ],
            column_config={
                "primary_section_id": st.column_config.TextColumn(
                    "Course",
                    width="none",
                ),
                "title": st.column_config.TextColumn(
                    "Title",
                    width="none",
                ),
                "days_code": st.column_config.TextColumn(
                    "Days",
                    width="none",
                ),
                "start_time_24hr": st.column_config.TimeColumn(
                    "Start Time", format="h:mm a"
                ),
                "stop_time_24hr": st.column_config.TimeColumn(
                    "End Time", format="h:mm a"
                ),
                "quarter": st.column_config.TextColumn(
                    "Term",
                    width="none",
                ),
                "instructor": st.column_config.TextColumn(
                    "Instructor",
                    width="none",
                ),
                "credit_unit": st.column_config.NumberColumn("CU"),
                "price_predicted": st.column_config.NumberColumn(
                    "Est. Price", format="%d"
                ),
                "Utility": st.column_config.NumberColumn(
                    "Utility",
                    width="none",
                ),
            },
            hide_index=True,
            use_container_width=True,
        )

        # Summary statistics using the solver's prices
        summary_cols = st.columns(3)

        # Get deltas from previous run if available
        delta_credits = None
        delta_price = None
        delta_utility = None

        if "prev_metrics" in st.session_state:
            delta_credits = (
                selected_courses["credit_unit"].sum()
                - st.session_state.prev_metrics["credits"]
            )
            delta_price = (
                selected_courses["price_predicted"].sum()
                - st.session_state.prev_metrics["price"]
            )
            weighted_utility = (
                selected_courses["Utility"] * selected_courses["credit_unit"]
            ).sum()
            delta_utility = (
                weighted_utility - st.session_state.prev_metrics["weighted_utility"]
            )

        with summary_cols[0]:
            st.metric(
                "Total Credits",
                f"{selected_courses['credit_unit'].sum():.1f}",
                delta=(
                    f"{delta_credits:.1f}"
                    if delta_credits is not None and delta_credits != 0
                    else None
                ),
            )
        with summary_cols[1]:
            st.metric(
                "Total Price",
                f"{selected_courses['price_predicted'].sum():,.0f}",
                delta=(
                    f"{delta_price:,.0f}"
                    if delta_price is not None and delta_price != 0
                    else None
                ),
            )
        with summary_cols[2]:
            weighted_utility = (
                selected_courses["Utility"] * selected_courses["credit_unit"]
            ).sum()
            st.metric(
                "Total Weighted Utility",
                f"{weighted_utility:,.0f}",
                delta=(
                    f"{delta_utility:,.0f}"
                    if delta_utility is not None and delta_utility != 0
                    else None
                ),
            )

with tab3:
    st.header("Simulation Results")

    st.write(
        """
        This tab shows the results of a Monte Carlo simulation of your schedule.
        It does the following:
        - Simulates your schedule 100 times (rolling the dice each time)
        - Tracks the number of times each course and complete schedule appeared
        - Calculates the probability of receiving a given course
        - Calculates the probability of receiving a given schedule (top 3 most common)
    """
    )

    if "monte_carlo_results" not in st.session_state:
        st.info("Click 'Simulate Schedule (100x)' in the sidebar to see results here.")
    else:
        # Display individual course probabilities
        st.subheader("Individual Course Probabilities")
        course_probs = sorted(
            [
                {
                    "Probability (%)": prob * 100,
                    "Course": course_info["primary_section_id"],
                    "Title": course_info["title"],
                    "Days": course_info["days_code"],
                    "Start Time": course_info["start_time_24hr"],
                    "End Time": course_info["stop_time_24hr"],
                    "Term": course_info["quarter"],
                    "Instructor": course_info["instructor"],
                    "CU": course_info["credit_unit"],
                }
                for course_id, prob in st.session_state.monte_carlo_results[
                    "course_probabilities"
                ].items()
                for course_info in [
                    st.session_state.utility_data[
                        st.session_state.utility_data["uniqueid"] == course_id
                    ].iloc[0]
                ]
            ],
            key=lambda x: x["Probability (%)"],
            reverse=True,
        )

        st.dataframe(
            course_probs,
            column_config={
                "Probability (%)": st.column_config.NumberColumn(
                    "Probability (%)", format="%d%%"
                ),
                "Course": st.column_config.TextColumn(
                    "Course",
                    width="none",
                ),
                "Title": st.column_config.TextColumn(
                    "Title",
                    width="none",
                ),
                "Days": st.column_config.TextColumn(
                    "Days",
                    width="none",
                ),
                "Start Time": st.column_config.TimeColumn(
                    "Start Time", format="h:mm a"
                ),
                "End Time": st.column_config.TimeColumn("End Time", format="h:mm a"),
                "Term": st.column_config.TextColumn(
                    "Term",
                    width="none",
                ),
                "Instructor": st.column_config.TextColumn(
                    "Instructor",
                    width="none",
                ),
                "CU": st.column_config.NumberColumn("CU"),
            },
            hide_index=True,
            use_container_width=True,
        )

        # Display top 3 most common schedules
        st.subheader("Top 3 Most Likely Schedules")
        for i, schedule in enumerate(
            st.session_state.monte_carlo_results["schedule_probabilities"][:3], 1
        ):
            st.write("")  # Add some spacing
            st.subheader(f"Schedule #{i}")
            schedule_courses = st.session_state.utility_data[
                st.session_state.utility_data["uniqueid"].isin(schedule["courses"])
            ]

            # Calculate metrics
            total_credits = schedule_courses["credit_unit"].sum()
            total_price = schedule_courses["price_predicted"].sum()
            weighted_utility = (
                schedule_courses["Utility"] * schedule_courses["credit_unit"]
            ).sum()

            # Display metrics in columns
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                st.metric("Probability", f"{schedule['probability']*100:.0f}%")
            with col2:
                st.metric("Total Credits", f"{total_credits:.1f}")
            with col3:
                st.metric("Total Price", f"{total_price:,.0f}")
            with col4:
                st.metric("Weighted Utility", f"{weighted_utility:.0f}")

            st.dataframe(
                schedule_courses[
                    [
                        "primary_section_id",
                        "title",
                        "days_code",
                        "start_time_24hr",
                        "stop_time_24hr",
                        "quarter",
                        "instructor",
                        "credit_unit",
                        "price_predicted",
                        "Utility",
                    ]
                ],
                column_config={
                    "primary_section_id": st.column_config.TextColumn(
                        "Course",
                        width="none",
                    ),
                    "title": st.column_config.TextColumn(
                        "Title",
                        width="none",
                    ),
                    "days_code": st.column_config.TextColumn(
                        "Days",
                        width="none",
                    ),
                    "start_time_24hr": st.column_config.TimeColumn(
                        "Start Time", format="h:mm a"
                    ),
                    "stop_time_24hr": st.column_config.TimeColumn(
                        "End Time", format="h:mm a"
                    ),
                    "quarter": st.column_config.TextColumn(
                        "Term",
                        width="none",
                    ),
                    "instructor": st.column_config.TextColumn(
                        "Instructor",
                        width="none",
                    ),
                    "credit_unit": st.column_config.NumberColumn("CU"),
                    "price_predicted": st.column_config.NumberColumn(
                        "Est. Price", format="%d"
                    ),
                    "Utility": st.column_config.NumberColumn(
                        "Utility",
                        width="none",
                    ),
                },
                hide_index=True,
                use_container_width=True,
            )

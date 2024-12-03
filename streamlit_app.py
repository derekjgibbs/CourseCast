import streamlit as st
import pandas as pd
from coursematch_solver import CourseMatchSolver

st.set_page_config(layout="wide")  # Add this as the first st command

# Add sidebar
with st.sidebar:
    st.title("Budget and CUs")
    
    # Add numeric inputs
    tokens = st.number_input(
        "Number of Tokens",
        min_value=3000,
        max_value=5500,
        value=4500,  # default value
        step=100,
        help="Set your token allocation"
    )
    # Add credit input 
    max_credits = st.number_input(
        "Maximum Credit Units",
        min_value=3.0,
        max_value=7.5,
        value=5.0,  # default value
        step=0.5,
        help="Set your maximum credit units"
    )

    # Add seed input
    seed = st.number_input(
        "Random Seed #",
        min_value=1,
        max_value=100,
        step=1
    )

    # Add a run button to the sidebar
    if st.sidebar.button("Run 1x", type="primary"):
        # Check if there are any courses with utility > 0
        courses_with_utility = st.session_state.utility_data[
            st.session_state.utility_data['Utility'] > 0
        ]
        
        if len(courses_with_utility) == 0:
            st.sidebar.error("Please add utility values to at least one course and click 'Save Utility Values' before running the solver.")
        else:
            # Create the solver input message
            solver_input = {
                "budget": tokens,
                "max_credits": max_credits,
                "seed": seed,
                "courses": [
                    {
                        "uniqueid": row['uniqueid'],
                        "utility": row['Utility']
                    }
                    for _, row in courses_with_utility.iterrows()
                ]
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
                
                # Display results
                st.sidebar.write("Selected Courses:")
                st.sidebar.write(selected)

                # Store both uniqueids and prices in session state
                st.session_state.solver_results = selected  # Store the full solver results
                st.session_state.selected_uniqueids = [item['uniqueid'] for item in selected]  # Extract just the uniqueids

            except Exception as e:
                import traceback
                st.sidebar.error(f"Error running solver: {str(e)}")
                st.sidebar.error("Full error trace:")
                st.sidebar.code(traceback.format_exc())

st.title("CourseCast v1.0")
st.write(
    "Let's start building! For help and inspiration, head over to [docs.streamlit.io](https://docs.streamlit.io/)."
)

# Initialize session state if needed
if 'utility_data' not in st.session_state:
    # Load the data
    df = pd.read_excel("data_spring_2025.xlsx")
    df['department'] = df['primary_section_id'].str[:4]
    df['quarter'] = df['part_of_term'].map({
        3: 'Q3',
        4: 'Q4',
        'S': 'Full',
        'Modular': 'Block'
    })
    
    # Add Utility column
    df.insert(0, 'Utility', 0)
    st.session_state.utility_data = df

# Initialize filter states if needed
if 'filters' not in st.session_state:
    st.session_state.filters = {
        'search': '',
        'department': 'All',
        'instructor': 'All',
        'days': 'All',
        'time': 'All',
        'credits': 'All',
        'quarter': 'All',
        'hide_zero': False
    }

# Add search box
search = st.text_input("Search", value=st.session_state.filters['search'], placeholder="Search", key='search')
st.session_state.filters['search'] = search

# Create filter row with columns using specific widths
filter_cols = st.columns([1.5, 2, 1, 1.5, 0.8, 0.8, 1.5])

with filter_cols[0]:
    departments = ['All'] + sorted(st.session_state.utility_data['department'].unique().tolist())
    selected_dept = st.selectbox('Department', departments, key='dept_select')
    st.session_state.filters['department'] = selected_dept

with filter_cols[1]:
    instructors = ['All'] + sorted(st.session_state.utility_data['instructor'].unique().tolist())
    selected_instructor = st.selectbox('Instructor', instructors, key='instructor_select')
    st.session_state.filters['instructor'] = selected_instructor

with filter_cols[2]:
    days = ['All'] + sorted(st.session_state.utility_data['days_code'].unique().tolist())
    selected_days = st.selectbox('Day', days, key='days_select')
    st.session_state.filters['days'] = selected_days

with filter_cols[3]:
    # Convert 24hr times to 12hr format for display
    times_24hr = sorted(st.session_state.utility_data['start_time_24hr'].unique().tolist())
    times_12hr = ['All'] + [t.strftime('%-I:%M %p') for t in times_24hr]
    times_dict = dict(zip(times_12hr[1:], times_24hr))  # Create mapping excluding 'All'
    
    selected_time_12hr = st.selectbox('Time', times_12hr, key='time_select')
    # Convert back to 24hr format for filtering
    selected_time = times_dict.get(selected_time_12hr, 'All')
    st.session_state.filters['time'] = selected_time

with filter_cols[4]:
    credits = ['All', '0.5', '1.0']
    selected_credits = st.selectbox('CU', credits, key='credits_select')
    st.session_state.filters['credits'] = selected_credits

with filter_cols[5]:
    quarters = ['All', 'Q3', 'Q4', 'Full', 'Block']
    selected_quarter = st.selectbox('Qtr', quarters, key='quarter_select')
    st.session_state.filters['quarter'] = selected_quarter

with filter_cols[6]:
    hide_zero = st.checkbox('Hide Zero Utility', key='hide_zero_select')
    st.session_state.filters['hide_zero'] = hide_zero


# Reset button - now only resets filters
if st.button("Reset", type="secondary"):
    st.session_state.filters = {
        'search': '',
        'department': 'All',
        'instructor': 'All',
        'days': 'All',
        'time': 'All',
        'credits': 'All',
        'quarter': 'All',
        'hide_zero': False
    }
    st.rerun()


# Apply filters to the session state data
filtered_data = st.session_state.utility_data.copy()
if selected_dept != 'All':
    filtered_data = filtered_data[filtered_data['department'] == selected_dept]
if selected_instructor != 'All':
    filtered_data = filtered_data[filtered_data['instructor'] == selected_instructor]
if selected_days != 'All':
    filtered_data = filtered_data[filtered_data['days_code'] == selected_days]
if selected_credits != 'All':
    filtered_data = filtered_data[filtered_data['credit_unit'] == float(selected_credits)]
if selected_quarter != 'All':
    filtered_data = filtered_data[filtered_data['quarter'] == selected_quarter]
if selected_time != 'All':
    filtered_data = filtered_data[filtered_data['start_time_24hr'] == selected_time]
if search:
    filtered_data = filtered_data[
        filtered_data.astype(str).apply(
            lambda x: x.str.contains(search, case=False)
        ).any(axis=1)
    ]
if hide_zero:
    filtered_data = filtered_data[filtered_data['Utility'] > 0]

# Display the edited data frame
edited_df = st.data_editor(
    filtered_data[[
        'Utility', 
        'primary_section_id', 
        'title', 
        'days_code',
        'start_time_24hr',
        'stop_time_24hr',
        'quarter',
        'instructor', 
        'credit_unit',
        'price_predicted'
    ]],
    key="course_editor",
    column_config={
        "Utility": st.column_config.NumberColumn(
            "Utility",
            min_value=0,
            max_value=100,
            step=1,
            default=0,
            width = "small"
        ),
        "primary_section_id": st.column_config.TextColumn(
            "Course",
            width="none",
            disabled=True
        ),
        "title": st.column_config.TextColumn(
            "Title",
            width="none",
            disabled=True
        ),
        "days_code": st.column_config.TextColumn(
            "Days",
            width="none",
            disabled=True
        ),
        "start_time_24hr": st.column_config.TimeColumn(
            "Start",
            width="none",
            disabled=True,
            format="h:mm a"  # This will format like "9:30 AM"
        ),
        "stop_time_24hr": st.column_config.TimeColumn(
            "End",
            width="none",
            disabled=True,
            format="h:mm a"
        ),
        "quarter": st.column_config.TextColumn(
            "Term",
            width="none",
            disabled=True
        ),
        "instructor": st.column_config.TextColumn(
            "Instructor",
            width="none",
            disabled=True
        ),
        "credit_unit": st.column_config.NumberColumn(
            "CU",
            width="none",
            disabled=True
        ),
        "price_predicted": st.column_config.NumberColumn(
            "Forecast Price",
            width="none",
            disabled=True,
            format="%d"
        ),
    },
    hide_index=True,
    use_container_width=True,
)

# Add a save button
if st.button("Save Utility Values"):
    if edited_df is not None:
        utility_updates = edited_df.set_index('primary_section_id')['Utility']
        mask = st.session_state.utility_data['primary_section_id'].isin(utility_updates.index)
        st.session_state.utility_data.loc[mask, 'Utility'] = st.session_state.utility_data.loc[mask, 'primary_section_id'].map(utility_updates)
        st.success("Utility values saved successfully!")

# Add a divider and section for results
st.divider()
st.header("Optimization Results")

# Add this near the top of your optimization results section
results_section = st.empty()  # This creates an anchor point

# Display selected courses if we have them
if 'selected_uniqueids' in st.session_state and st.session_state.selected_uniqueids:
     
    # First, create a dictionary of uniqueid -> price from solver results
    solver_prices = {item['uniqueid']: item['price'] for item in st.session_state.solver_results}  # Use session state instead of selected
    
    # Get the full information for selected courses
    mask = st.session_state.utility_data['uniqueid'].isin(st.session_state.selected_uniqueids)
    selected_courses = st.session_state.utility_data[mask]
    
    # Update prices with solver prices
    selected_courses['price_predicted'] = selected_courses['uniqueid'].map(solver_prices)
    
    st.write("Selected Courses:")
    st.dataframe(
        selected_courses[[
            'primary_section_id',
            'title',
            'days_code',
            'start_time_24hr',
            'stop_time_24hr',
            'quarter',
            'instructor',
            'credit_unit',
            'price_predicted',  # This will now show the solver's price
            'Utility'
        ]],
        column_config={
            "primary_section_id": "Course",
            "start_time_24hr": st.column_config.TimeColumn("Start", format="h:mm a"),
            "stop_time_24hr": st.column_config.TimeColumn("End", format="h:mm a"),
            "price_predicted": st.column_config.NumberColumn("Est. Price", format="%d"),
        },
        hide_index=True,
        use_container_width=True
    )
    
    # Summary statistics using the solver's prices
    summary_cols = st.columns(3)
    with summary_cols[0]:
        st.metric("Total Credits", f"{selected_courses['credit_unit'].sum()}")
    with summary_cols[1]:
        st.metric("Total Price", f"{selected_courses['price_predicted'].sum():,.0f}")
    with summary_cols[2]:
        weighted_utility = (selected_courses['Utility'] * selected_courses['credit_unit']).sum()
        st.metric("Total Weighted Utility", f"{weighted_utility:,.0f}")
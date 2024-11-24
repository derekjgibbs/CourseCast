import streamlit as st

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

    max_credits = st.number_input(
        "Maximum Credit Units",
        min_value=3.0,
        max_value=7.5,
        value=5.0,  # default value
        step=0.5,
        help="Set your maximum credit units"
    )

st.title("CourseCast v1.0")
st.write(
    "Let's start building! For help and inspiration, head over to [docs.streamlit.io](https://docs.streamlit.io/)."
)

import streamlit as st
import pandas as pd

# Initialize session state if needed
if 'utility_data' not in st.session_state:
    # Load the data
    df = pd.read_excel("data_spring_2025.xlsx")
    df['department'] = df['primary_section_id'].str[:4]
    df['quarter'] = df['part_of_term'].map({
        '3': 'Q3',
        '4': 'Q4',
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
    selected_dept = st.selectbox('Department', departments, 
                                index=departments.index(st.session_state.filters['department']))
    st.session_state.filters['department'] = selected_dept

with filter_cols[1]:
    instructors = ['All'] + sorted(st.session_state.utility_data['instructor'].unique().tolist())
    selected_instructor = st.selectbox('Instructor', instructors,
                                     index=instructors.index(st.session_state.filters['instructor']))
    st.session_state.filters['instructor'] = selected_instructor

with filter_cols[2]:
    days = ['All'] + sorted(st.session_state.utility_data['days_code'].unique().tolist())
    selected_days = st.selectbox('Day', days,
                                index=days.index(st.session_state.filters['days']))
    st.session_state.filters['days'] = selected_days

with filter_cols[3]:
    times = ['All', 'Morning', 'Afternoon', 'Evening']
    selected_time = st.selectbox('Time', times,
                                index=times.index(st.session_state.filters['time']))
    st.session_state.filters['time'] = selected_time

with filter_cols[4]:
    credits = ['All', '0.5', '1.0']
    selected_credits = st.selectbox('CU', credits,
                                  index=credits.index(st.session_state.filters['credits']))
    st.session_state.filters['credits'] = selected_credits

with filter_cols[5]:
    quarters = ['All', 'Q3', 'Q4', 'Full', 'Block']
    selected_quarter = st.selectbox('Qtr', quarters,
                                  index=quarters.index(st.session_state.filters['quarter']))
    st.session_state.filters['quarter'] = selected_quarter

with filter_cols[6]:
    hide_zero = st.checkbox('Hide Zero Utility', 
                          value=st.session_state.filters['hide_zero'])
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
    time_filters = {
        'Morning': (filtered_data['start_time_24hr'] < '12:00'),
        'Afternoon': (filtered_data['start_time_24hr'] >= '12:00') & (filtered_data['start_time_24hr'] < '15:30'),
        'Evening': (filtered_data['start_time_24hr'] >= '15:30')
    }
    if selected_time in time_filters:
        filtered_data = filtered_data[time_filters[selected_time]]
if search:
    filtered_data = filtered_data[
        filtered_data.astype(str).apply(
            lambda x: x.str.contains(search, case=False)
        ).any(axis=1)
    ]
if hide_zero:
    filtered_data = filtered_data[filtered_data['Utility'] > 0]

# Format meeting times and dates
def format_meetings(row):
    days = row['days_code']
    start = row['start_time_24hr']
    end = row['stop_time_24hr']
    quarter = row['quarter']
    start_date = pd.to_datetime(row['start_date']).strftime('%d %b')
    end_date = pd.to_datetime(row['end_date']).strftime('%d %b')
    
    time_str = f"{days} {start} - {end}"
    if quarter in ['Q3', 'Q4']:
        return f"{time_str}\n{quarter}, {start_date} - {end_date}"
    else:
        return f"{time_str}\n{quarter}, {start_date} - {end_date}"

filtered_data['Meetings'] = filtered_data.apply(format_meetings, axis=1)

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
        'price'
    ]],
    key="course_editor",
    column_config={
        "Utility": st.column_config.NumberColumn(
            "Utility",
            help="Rate this course from 0-100",
            min_value=0,
            max_value=100,
            step=1,
            default=0,
        ),
        "primary_section_id": st.column_config.TextColumn(
            "Course",
            width="medium",
            disabled=True
        ),
        "title": st.column_config.TextColumn(
            "Title",
            width="large",
            disabled=True
        ),
        "days_code": st.column_config.TextColumn(
            "Days",
            width="small",
            disabled=True
        ),
        "start_time_24hr": st.column_config.TimeColumn(
            "Start",
            width="small",
            disabled=True,
            format="h:mm a"  # This will format like "9:30 AM"
        ),
        "stop_time_24hr": st.column_config.TimeColumn(
            "End",
            width="small",
            disabled=True,
            format="h:mm a"
        ),
        "quarter": st.column_config.TextColumn(
            "Term",
            width="small",
            disabled=True
        ),
        "instructor": st.column_config.TextColumn(
            "Instructor",
            width="medium",
            disabled=True
        ),
        "credit_unit": st.column_config.NumberColumn(
            "CU",
            width="small",
            disabled=True
        ),
        "price": st.column_config.NumberColumn(
            "Price",
            width="medium",
            disabled=True,
            format="%d"
        ),
    },
    hide_index=True,
    use_container_width=True,
)

# Update the master dataset with any edits
for index, row in edited_df.iterrows():
    course_id = row['primary_section_id']
    new_utility = row['Utility']
    st.session_state.utility_data.loc[
        st.session_state.utility_data['primary_section_id'] == course_id,
        'Utility'
    ] = new_utility
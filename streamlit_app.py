import streamlit as st

st.title("CourseCast v1.0")
st.write(
    "Let's start building! For help and inspiration, head over to [docs.streamlit.io](https://docs.streamlit.io/)."
)

import streamlit as st
import pandas as pd

# Load directly from the file in your repository
excel_data = pd.read_excel("data_spring_2025.xlsx")

# Create a copy and add the Utility column with default values
editable_data = excel_data.copy()
if 'Utility' not in editable_data.columns:
    editable_data.insert(0, 'Utility', 0)  # Insert at front (position 0)

# Display editable dataframe
edited_df = st.data_editor(
    editable_data,
    use_container_width=True,
    hide_index=True,
    column_config={
        "Utility": st.column_config.NumberColumn(
            "Utility",
            help="Rate this course from 0-100",
            min_value=0,
            max_value=100,
            step=1,
            default=0,
        ),
        # Make other columns read-only
        "Course Code": st.column_config.TextColumn(
            "Course Code",
            disabled=True
        ),
        "Department": st.column_config.TextColumn(
            "Department",
            disabled=True
        )
    },
    disabled=False  # Allow editing of non-disabled columns
)
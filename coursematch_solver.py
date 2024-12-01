import pandas as pd
import json
import datetime
from itertools import product
from pulp import LpMaximize, LpProblem, LpVariable, lpSum

example_input = {
    "budget": 5000,
    "max_credits": 5.5,
    "courses": [
        {"uniqueid": 19, "utility": 50},
        {"uniqueid": 20, "utility": 60},
        {"uniqueid": 21, "utility": 60},
        {"uniqueid": 22, "utility": 60},
        {"uniqueid": 23, "utility": 60},
        {"uniqueid": 24, "utility": 60},
        {"uniqueid": 75, "utility": 60},
        {"uniqueid": 76, "utility": 60},
        {"uniqueid": 77, "utility": 60},
        {"uniqueid": 78, "utility": 60},
        {"uniqueid": 79, "utility": 60},
        {"uniqueid": 80, "utility": 60},
        {"uniqueid": 98, "utility": 60},
        {"uniqueid": 113, "utility": 60},
        {"uniqueid": 114, "utility": 60},
        {"uniqueid": 127, "utility": 60},
        {"uniqueid": 129, "utility": 60},
        {"uniqueid": 154, "utility": 60},
        {"uniqueid": 155, "utility": 60},
        {"uniqueid": 171, "utility": 60},
        {"uniqueid": 172, "utility": 60},
        {"uniqueid": 184, "utility": 60},
        {"uniqueid": 185, "utility": 60},
        {"uniqueid": 186, "utility": 60},
    ]
}

example_output = {
    "uniqueids": [
        21,
        24,
        79,
        98,
        113,
        172,
        185
    ]
}

class PreProcessor(object):
    def __init__(self):
        pass

    def preprocess(self, df):
        self.df = df
        #print(self.df)
        self.drop_unused_columns()
        self.preprocess_primary_section_id()
        self.preprocess_class_time()
        print(self.df)
        return self.df

    def drop_unused_columns(self):
        columns_to_drop = ['term', 'title', 'instructor', 'start_date', 'end_date', 'capacity']
        self.df = self.df.drop(columns=columns_to_drop)

    def preprocess_primary_section_id(self):
        def rename_course_id(course_id):
            map = {
                "STAT6130": "FC_STAT",
                "STAT6210": "FC_STAT",
                "WHCP6160": "FC_WHCP",
                "WHCP6180": "FC_WHCP",
                "ACCT6110": "FC_ACCT",
                "ACCT6130": "FC_ACCT",
                "FNCE6110": "FC_FNCE",
                "FNCE6210": "FC_FNCE",
                "FNCE6130": "FC_MACRO",
                "FNCE6230": "FC_MACRO",
                "MGMT6110": "FC_MGMT",
                "MGMT6120": "FC_MGMT",
                "MKTG6120": "FC_MKTG",
                "MKTG6130": "FC_MKTG",
                # Cross-listed
                "ACCT7970": "TABS", # Taxes and Business Strategy
                "FNCE7970": "TABS",
                "BEPP7630": "EMAP", # Energy Markets and Policy
                "OIDD7630": "EMAP",
                "LGST8050": "AABT", # Antitrust and Big Tech
                "MKTG7600": "AABT",
                "LGST8060": "NEGO", # Negotiations
                "MGMT6910": "NEGO",
                "OIDD6910": "NEGO",
                "LGST8090": "SBM", # Sports Business Management
                "MGMT8150": "SBM",
                "MGMT7290": "IPSIDE", # Intellectual Property Strategy for the Innovation-Driven Enterprise
                "LGST7290": "IPSIDE",
                "OIDD6900": "MDM", # Managerial Decision Making
                "MGMT6900": "MDM",
                "OIDD6930": "INFL", # Influence
                "LGST6930": "INFL",
                "OIDD7610": "RAEM", # Risk Analysis and Environmental Management
                "BEPP7610": "RAEM",
                "REAL7080": "HM", # Housing Markets
                "BEPP7080": "HM",
                "REAL7210": "REIAF", # Real Estate Investment: Analysis and Financing
                "FNCE7210": "REIAF",
                "REAL8040": "REL", # Real Estate Law
                "LGST8040": "REL",
                "REAL8360": "IHC", # International Housing Comparisons
                "BEPP8360": "IHC",
                "STAT7770": "IPDS", # Introduction to Python for Data Science
                "OIDD7770": "IPDS",
                #"MKTG7120": "DAMD", # Data and Analysis for Marketing Decisions - only section id differs
            }
            if course_id in map.keys():
                return map[course_id]
            return course_id

        def split_primary_section_id(section_id):
            course_id = rename_course_id(section_id[:8])
            section_code = section_id[8:]
            return course_id, section_code

        # Split into separate columns
        self.df[['course_id', 'section_code']] = (
            self.df['primary_section_id'].apply(lambda x: pd.Series(split_primary_section_id(x)))
        )

    def preprocess_class_time(self):
        all_classes = set()
        classes = dict()
        for index, row in self.df.iterrows():
            part_of_term = row["part_of_term"]
            days_code = row["days_code"]
            start_time = row["start_time_24hr"]
            stop_time = row["stop_time_24hr"]

            terms = self.get_terms(part_of_term)
            days = self.get_days(days_code)
            time_class = self.get_time_class(start_time, stop_time)

            combinations = ["ct_"+x+y+z for x in terms for y in days for z in time_class]
            classes[index] = combinations
            for c in combinations:
                all_classes.add(c)

        # make new columns filled with 0
        for c in all_classes:
            self.df[c] = [0] * len(self.df)

        # mark 1 for each class_time
        for index, row in self.df.iterrows():
            for c in classes[index]:
                self.df.loc[index, c] = 1

    def get_terms(self, part_of_term):
        part_of_term = str(part_of_term)
        map = {
            '1': ['q1'],
            '2': ['q2'],
            '3': ['q3'],
            '4': ['q4'],
            'F': ['q1', 'q2'],
            'S': ['q3', 'q4'],
            'M': ['mod'],
            'Modular': ['mod']
        }
        return map[part_of_term]

    def get_days(self, days_code):
        map = {
            'M': ['M'],
            'T': ['T'],
            'W': ['W'],
            'R': ['R'],
            'F': ['F'],
            'S': ['S'],
            'U': ['U'],
            'MW': ['M', 'W'],
            'TR': ['T', 'R'],
            'FS': ['F', 'S'],
            'TBA': ['TBA']
        }
        return map[days_code]

    def get_time_class(self, start_time, stop_time):
        start_dt = datetime.datetime.combine(datetime.datetime.today(), start_time)
        stop_dt = datetime.datetime.combine(datetime.datetime.today(), stop_time)
        duration = (stop_dt - start_dt).total_seconds() / 3600 # HRs

        map = {
            datetime.time(8, 30, 00): 'A',
            datetime.time(10, 15, 00): 'B',
            datetime.time(12, 00, 00): 'C',
            datetime.time(13, 45, 00): 'D',
            datetime.time(15, 30, 00): 'E',
            datetime.time(17, 15, 00): 'F',
            datetime.time(19, 00, 00): 'G',
            datetime.time(20, 45, 00): 'H',
            datetime.time(22, 30, 00): 'I',
            datetime.time(00, 00, 00): 'Z',
        }
        if duration > 2:
            new_start_time = (start_dt + datetime.timedelta(hours=1, minutes=45)).time()
            return [map[start_time], map[new_start_time]]
        return [map[start_time]]

class CourseMatchSolver(object):
    def __init__(self, sourceXlsx, candidates):
        self.source = sourceXlsx
        self.candidates = candidates
        self.source_data = pd.read_excel(sourceXlsx)

        self.preprocessor = PreProcessor()

    def solve(self):
        self.unpack(self.candidates)
        self.mergeData()
        self.setupPrice()
        self.preprocess()
        selected = self.solveLP()
        selected_data = self.pack(selected)

        return selected_data
        #return example_output
    
    def unpack(self, data):
        self.budget = data["budget"]
        self.max_credits = data["max_credits"]
        self.courses = data["courses"]
        self.uniqueids = [course["uniqueid"] for course in self.courses]
        self.utilities = [course["utility"] for course in self.courses]
    
    def mergeData(self):
        self.df = self.source_data[self.source_data['uniqueid'].isin(self.uniqueids)]
        self.df['utilities'] = self.utilities

    def setupPrice(self):
        pass

    def preprocess(self):
        self.df = self.preprocessor.preprocess(self.df)
        pass

    def solveLP(self):
        # Define the linear programming problem
        prob = LpProblem("Course_Scheduler", LpMaximize)

        # Create binary variables for each row
        row_vars = {row["uniqueid"]: LpVariable(f"x_{row['uniqueid']}", cat="Binary") for _, row in self.df.iterrows()}

        # Objective function: Maximize the sum of utilities times credits for selected courses
        prob += lpSum(row_vars[row["uniqueid"]] * row["utilities"] * row["credit_unit"] for _, row in self.df.iterrows()), "Total_Utility"

        # Constraints
        # 1. Budget constraint: Sum of prices for selected courses must not exceed the budget
        prob += lpSum([row['price'] * row_vars[row['uniqueid']] for _, row in self.df.iterrows()]) <= self.budget, "Budget_Constraint"

        # 2. Course unit constraint: Sum of credit_units for selected courses must not exceed the max_credits
        prob += lpSum([row['credit_unit'] * row_vars[row['uniqueid']] for _, row in self.df.iterrows()]) <= self.max_credits, "Max_Credit_Constraint"

        # 3. Constraints to ensure no duplicate course_id is selected
        for course_id in self.df["course_id"].unique():
            prob += (
                lpSum(row_vars[row["uniqueid"]] for _, row in self.df.iterrows() if row["course_id"] == course_id) <= 1,
                f"Max_One_{course_id}",
            )

        # 4. Constraints to ensure no two courses at the same time is selected
        for col in self.df.columns:
            if col.startswith("ct_"):
                prob += (
                    lpSum(row_vars[row["uniqueid"]] for _, row in self.df.iterrows() if row[col] == 1) <= 1,
                    f"No_Overlap_{col}",
                )

        # Solve the problem
        prob.solve()

        # Extract the selected rows
        selected_rows = [row["uniqueid"] for _, row in self.df.iterrows() if row_vars[row["uniqueid"]].varValue == 1]

        # Print the results
        print("Selected Rows:")
        print(self.df[self.df["uniqueid"].isin(selected_rows)])
        return selected_rows
    
    def pack(self, data):
        return data
    

if __name__ == "__main__":
    cms = CourseMatchSolver("data_spring_2025.xlsx", example_input)
    selected = cms.solve()
    print(selected)
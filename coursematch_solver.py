import pandas as pd
import json

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

class CourseMatchSolver(object):
    def __init__(self, sourceXlsx, candidates):
        self.source = sourceXlsx
        self.candidates = candidates
        self.source_data = pd.read_excel(sourceXlsx)

    def solve(self):
        self.unpack(self.candidates)
        self.mergeData()
        self.setupPrice()
        self.preprocess()
        selected = self.solveLP()
        selected_data = self.pack(selected)

        #return selected_data
        return example_output
    
    def unpack(self, data):
        self.budget = data["budget"]
        self.max_credits = data["max_credits"]
        self.courses = data["courses"]
        self.uniqueids = [course["uniqueid"] for course in self.courses]
        self.utilities = [course["utility"] for course in self.courses]
    
    def mergeData(self):
        self.df = self.source_data[self.source_data['uniqueid'].isin(self.uniqueids)]
        self.df['utilities'] = self.utilities
        #print(self.df)

    def setupPrice(self):
        pass

    def preprocess(self):
        pass

    def solveLP(self):
        return []
    
    def pack(self, data):
        return data
    

if __name__ == "__main__":
    cms = CourseMatchSolver("data_spring_2025.xlsx", example_input)
    selected = cms.solve()
    print(selected)
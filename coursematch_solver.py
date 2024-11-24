import pandas as pd
import json

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

        return selected_data
    
    def unpack(self, data):
        pass
    
    def mergeData(self):
        pass

    def setupPrice(self):
        pass

    def preprocess(self):
        pass

    def solveLP(self):
        return []
    
    def pack(self, data):
        return data
    

if __name__ == "__main__":
    example_str = '{ \
            "budget": 5000, \
            "credit_units": 5.5, \
            "courses":[\
                {"id": 2, "utility": 50}, \
                {"id": 21, "utility": 60}, \
                {"id": 22, "utility": 60}, \
                {"id": 23, "utility": 60}, \
                {"id": 24, "utility": 60} \
            ] \
        }'
    data = json.loads(example_str)
    cms = CourseMatchSolver("data_spring_2025.xlsx", data)
    selected = cms.solve()
    print(selected)
import pandas as pd
import numpy as np

# The Employee data

# Read the Data 
dataEmployee = pd.read_excel("../MC1_2021/EmployeeRecords.xlsx", sheet_name='Employee Records')

# Get DataFrame
df = pd.DataFrame(dataEmployee)

# Select and Rename Columns
df1 = df[["CurrentEmploymentType", "CurrentEmploymentTitle"]]
df2 = df1.rename(columns={"CurrentEmploymentType": "TYPE"})
df2 = df2.rename(columns={"CurrentEmploymentTitle": "TITLE"})

# Calculate the Sum based on TYPE and TITLE.
# Use pandas.pivot_table to Rearrange the df
df2.at[:, ["TOTAL"]] = 1
table1 = pd.pivot_table(df2, values="TOTAL", index=['TYPE', 'TITLE'], aggfunc=np.sum, fill_value=0)
table2 = pd.pivot_table(df2, values="TOTAL", index=['TYPE'], aggfunc=np.sum, fill_value=0)

# Output the CSV file which has 3 columns: TYPE, TITLE, TOTAL
table1.to_csv("../data/employee-type-title-total-data.csv", index=True)

# Output the CSV file which has 2 columns: TYPE, TOTAL
table2.to_csv("../data/employee-type-total-data.csv", index=True)
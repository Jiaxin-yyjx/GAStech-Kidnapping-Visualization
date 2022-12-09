import pandas as pd
import numpy as np
import json
from gensim.parsing.preprocessing import STOPWORDS
from gensim.models import Word2Vec
import re

########## 1. Employee Type and Title data
########## df, df1, df2, df3

# Read the Data 
dataEmployee = pd.read_excel("../MC1_2021/EmployeeRecords.xlsx", sheet_name='Employee Records')

# Get DataFrame
df = pd.DataFrame(dataEmployee)

# Select and Rename Columns
df1 = df[["CurrentEmploymentType", "CurrentEmploymentTitle", "FirstName", "LastName", "EmailAddress"]]
df2 = df1.rename(columns={"CurrentEmploymentType": "TYPE"})
df2 = df2.rename(columns={"CurrentEmploymentTitle": "TITLE"})
df2 = df2.rename(columns={"FirstName": "FIRST"})
df2 = df2.rename(columns={"LastName": "LAST"})
df2 = df2.rename(columns={"EmailAddress": "EMAIL"})

nameTypeList = df2[["FIRST", "LAST", "EMAIL", "TYPE"]].values.tolist()
emailIndex = 2
typeIndex = 3

# Calculate the Sum based on TYPE and TITLE.
# Use pandas.pivot_table to Rearrange the df
df2.at[:, ["TOTAL"]] = 1
table1 = pd.pivot_table(df2, values="TOTAL", index=['TYPE', 'TITLE'], aggfunc=np.sum, fill_value=0)
table2 = pd.pivot_table(df2, values="TOTAL", index=['TYPE'], aggfunc=np.sum, fill_value=0).reset_index()  

# Output the CSV file which has 3 columns: TYPE, TITLE, TOTAL
table1.to_csv("../data/employee-type-title-total-data.csv", index=True)

# Output the CSV file which has 2 columns: TYPE, TOTAL
table2.to_csv("../data/employee-type-total-data.csv", index=True, index_label="INDEX")

########## End Employee Type and Title data



########## 2. Employee Email Contact data
########## df3, df4 and df5

# Read the Data 
dataContact = pd.read_csv("../MC1_2021/email headers.csv", encoding='cp1252')

# Get DataFrame
df3 = pd.DataFrame(dataContact)

# Select and Rename Columns, and Ensure indexes pair with number of rows
# TODO: We plan to use some NLP algorithm to filter emails
df4 = df3[["From", "To"]].reset_index()  

# Create Dict
dict = {
    "nodes": [],
    "links": []
}
uniqueEmailList = []
id = 1
fromId = -1
toId = -1
for index, row in df4.iterrows():
    fromEmail = row["From"].strip()
    toEmailList = row["To"].strip()

    # FROM
    if (fromEmail in uniqueEmailList):
        for elt in dict["nodes"]:
            if elt["name"] == fromEmail:
                fromId = elt["id"]   
    else:
        uniqueEmailList.append(fromEmail)

        # Define its Type
        found = False
        group = -1
        for elt in nameTypeList:
            email = elt[emailIndex]
            if (email == fromEmail):
                found = True
                type = elt[typeIndex]
                group = table2.index[table2['TYPE'] == type].to_list()[0]
                break
        if not found:
            print("Warning:" + fromEmail)

        dict["nodes"].append({
            "id": id,
            "name": fromEmail,
            "group": group
        })
        fromId = id
        id = id + 1
    
    # TO
    toEmailListArray = toEmailList.split(",")
    for toEmail in toEmailListArray:
        toEmail = toEmail.strip()
        
        if (toEmail in uniqueEmailList):
            for elt in dict["nodes"]:
                if elt["name"] == toEmail:
                    toId = elt["id"]   
        else:    
            uniqueEmailList.append(toEmail)

            # Define its Type
            found = False
            group = -1
            for elt in nameTypeList:
                email = elt[emailIndex]
                if (email == toEmail):
                    found = True
                    type = elt[typeIndex]
                    group = table2.index[table2['TYPE'] == type].to_list()[0]
                    break
            if not found:
                print("Warning:" + toEmail)

            dict["nodes"].append({
                "id": id,
                "name": toEmail,
                "group": group
            })
            toId = id
            id = id + 1
        
        found = False
        for link in dict["links"]:
            if (link["source"] == fromId) & (link["target"] == toId) | (link["source"] == toId) & (link["target"] == fromId) :
                link["number"] = link["number"] + 1 
                found = True
                break
        if not found:
            dict["links"].append({
                "source": fromId,
                "target": toId,
                "number": 1
            })

with open("../data/employee-email-contact-data.json", 'w', encoding='utf-8') as jsonf:
    jsonf.write(json.dumps(dict, indent=4))

########## End Employee Email Contact data
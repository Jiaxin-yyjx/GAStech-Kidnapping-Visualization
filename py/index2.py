import pandas as pd
import numpy as np
import json
from gensim.parsing.preprocessing import STOPWORDS
from gensim.models import Word2Vec

########## Employee Email Contact data

# Read the Data 
dataContact = pd.read_csv("../MC1_2021/email headers.csv", encoding='cp1252')

# Get DataFrame
df = pd.DataFrame(dataContact)

# Preparing the dataset
specialChars = ["!", "?", ":", ",", "."]
allStopwordsGensim = STOPWORDS.union(set(["fw", "i'm", "i've", "he's", "she's", "who's", "hey", "-"]))
subjectsList = df["Subject"].values.tolist()
newSubjectTextsList = []
for elt in subjectsList:
    filteredSubj = "".join(ch for ch in elt if ch not in specialChars).lower()
    texts = [word for word in filteredSubj.split() if not word in allStopwordsGensim]
    newSubjectTextsList.append(texts)
model = Word2Vec(sentences=newSubjectTextsList, vector_size=100, min_count=1, workers=4)
model.save("Word2Vec.model1")
similarWords = model.wv.most_similar('funny') 
print(similarWords)
# print(len(newSubjectTextsList))


# ########## Employee Email Contact data

# # Read the Data 
# dataContact = pd.read_csv("../MC1_2021/email headers.csv", encoding='cp1252')

# # Get DataFrame
# df = pd.DataFrame(dataContact)

# subjectsList = ["You never get a second chance to make a first impression", "123"]
# word2vec = Word2Vec(subjectsList, min_count=2)
# simWords = word2vec.wv.most_similar('work')
# print(simWords)

# # Select and Rename Columns, and Ensure indexes pair with number of rows
# df1 = df[~df["Subject"].str.contains("Joke") 
#     & ~df["Subject"].str.contains("coffee") 
#     & ~df["Subject"].str.contains("Plants") 
#     & ~df["Subject"].str.contains("birthday") 
#     & ~df["Subject"].str.contains("Funny")
#     & ~df["Subject"].str.contains("Ha ha")
#     & ~df["Subject"].str.contains("DECAF")
# ]
# df1 = df1[["From", "To"]].reset_index()  

# # Create Dict
# dict = {
#     "nodes": [],
#     "links": []
# }
# uniqueEmailList = []
# id = 1
# fromEmailId = 1
# toEmailId = 1
# for index, row in df1.iterrows():
#     fromEmail = row["From"].strip()
#     toEmailList = row["To"].strip()

#     if (fromEmail in uniqueEmailList):
#         for elt in dict["nodes"]:
#             if elt["name"] == fromEmail:
#                 fromEmailId = elt["id"]   
#     else:
#         uniqueEmailList.append(fromEmail)
#         dict["nodes"].append({
#             "id": id,
#             "name": fromEmail
#         })
#         fromEmailId = id
#         id = id + 1
    
#     toEmailListArray = toEmailList.split(",")
#     for toEmail in toEmailListArray:
#         toEmail = toEmail.strip()

#         if (toEmail in uniqueEmailList):
#             for elt in dict["nodes"]:
#                 if elt["name"] == toEmail:
#                     toEmailId = elt["id"]   
#         else:    
#             uniqueEmailList.append(toEmail)
#             dict["nodes"].append({
#                 "id": id,
#                 "name": toEmail
#             })
#             toEmailId = id
#             id = id + 1
        
#         found = False
#         for link in dict["links"]:
#             if (link["source"] == fromEmailId) & (link["target"] == toEmailId) | (link["source"] == toEmailId) & (link["target"] == fromEmailId) :
#                 link["number"] = link["number"] + 1 
#                 found = True
#                 break

#         if not found:
#             dict["links"].append({
#                 "source": fromEmailId,
#                 "target": toEmailId,
#                 "number": 1
#             })

#         # dict["FROM"].append(fromEmail)
#         # dict["TO"].append(toEmail)

# # Open a json writer, and use the json.dumps()
# # function to dump data
# with open("../data/employee-email-contact-data.json", 'w', encoding='utf-8') as jsonf:
#     jsonf.write(json.dumps(dict, indent=4))

# # dfFrom = pd.DataFrame(dict["FROM"], columns=["FROM"]).reset_index()
# # dfTo = pd.DataFrame(dict["TO"], columns=["TO"]).reset_index()

# # df2 = pd.merge(dfFrom, dfTo, on="index")[["FROM", "TO"]]

# # # Output the CSV file which has 3 columns: TYPE, TITLE, TOTAL
# # df2.to_csv("../data/employee-email-contact-data.csv", index=False)

# ########## End Employee Email Contact data
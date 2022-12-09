import pandas as pd
import numpy as np
import json
from gensim.parsing.preprocessing import STOPWORDS
from gensim.models import Word2Vec
import nltk

# nltk.download('punkt')
# nltk.download('averaged_perceptron_tagger')
# nltk.download('maxent_ne_chunker')
# nltk.download('words')

from nltk import ne_chunk, pos_tag, word_tokenize
from nltk.tree import Tree

import csv
import os

########## 1. Names Found in the Articles and News

allStopwordsGensim = STOPWORDS.union(set(["fw", "i'm", "i've", "he's", "she's", "who's", "hey", "-"]))

# Read the Data 
nameDictList = []
textsList = []
folderPath = "../MC1_2021/News Articles/"
subFolders = [ f.path for f in os.scandir(folderPath) if f.is_dir() ]
for folder in subFolders:
    # txt in Each Press
    for filename in os.listdir(folder):
        # Read txt
        print("Starting to read " + folder + "/" + filename)
        with open(os.path.join(folder, filename), encoding="ISO-8859-1") as f:
            for line in f.readlines():
                # Word tokenization; Tagging the tokens; Chunking the end result
                # https://www.nltk.org/book/ch05.html
                # https://www.nltk.org/book/ch07.html
                nltkResults = ne_chunk(pos_tag(word_tokenize(line)))
                for nltkResult in nltkResults:
                    # type Tree which means there’s some NER data in that field
                    # Explore each Leave which has Label and Name
                    if type(nltkResult) == Tree:
                        if nltkResult.label() == "PERSON":
                            name = ''
                            for nltkResultLeaf in nltkResult.leaves():
                                name += nltkResultLeaf[0] + ' '

                            found = False
                            for dict in nameDictList:    
                                if dict["NAME"] == name:
                                    dict["TOTAL"] = dict["TOTAL"] + 1
                                    found = True
                                    break
                            if not found:
                                nameDict = {}
                                nameDict["NAME"] = name  
                                nameDict["TOTAL"] = 1   
                                nameDict["SOURCE"] = folder.split("/")[len(folder.split("/")) - 1] 
                                nameDictList.append(nameDict)

with open("../data/name-articles-and-news-data.csv", 'w') as f:     
    # using csv.writer method from CSV package
    writer = csv.writer(f)

    writer.writerow(['NAME', 'TOTAL', "SOURCE"])  
    for dict in nameDictList:
        writer.writerow(dict.values())

########## End Names Found in the Articles and News

# Means all words that occur ≥ one time and generate a vector with a fixed length of five
# model = Word2Vec(sentences=textsList, vector_size=50, min_count=1)

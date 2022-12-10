import os
folderPath = "MC1_2021/News Articles/"
subFolders = [ f.path for f in os.scandir(folderPath) if f.is_dir() ]
all_in_one = open('data/all.txt', "w")
for folder in subFolders:
    f_name = folder.split('/')[2].strip().replace(" ", "_")
    out_f = open('data/'+f_name + ".txt", "w")
    for filename in os.listdir(folder):
        with open(os.path.join(folder, filename), encoding="ISO-8859-1") as f:
            for line in f.readlines():
                out_f.writelines(line + '\n')
                all_in_one.writelines(line + '\n')
    out_f.writelines('\n\n')
    all_in_one.writelines('\n\n')


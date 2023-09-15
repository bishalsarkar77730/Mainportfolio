import os
import json
import csv
import subprocess
from datetime import datetime

# Function to execute a shell command and capture its output
def run_command(command):
    result = subprocess.run(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
    return result.stdout, result.returncode

# Git commands
git_add = "git add ."
commit_message = input("Enter your commit message: ")
git_commit = f'git commit -m "{commit_message}"'
git_push = "git push origin main"

# Execute git commands
run_command(git_add)
run_command(git_commit)
output, return_code = run_command(git_push)

# Check if the git push was successful
if return_code != 0:
    print("Git push failed. Aborting.")
else:
    # Generate data for the report
    git_username = input("Enter your Git username: ")
    current_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    commit_id, _ = run_command("git rev-parse HEAD")

    # Create a new entry
    entry = {
        "name": git_username,
        "commit": commit_message,
        "date": current_date,
        "commitId": commit_id.strip()
    }

    # Update report.json
report_file = "report.json"

if os.path.exists(report_file) and os.path.getsize(report_file) > 0:
    with open(report_file, "r") as json_file:
        data = json.load(json_file)
else:
    data = []

# Add the new entry to the data list
data.append(entry)

# Save the updated data back to report.json
with open(report_file, "w") as json_file:
    json.dump(data, json_file, indent=4)

    # Update report.csv
    report_csv_file = "report.csv"
    with open(report_csv_file, "a", newline="") as csv_file:
        csv_writer = csv.DictWriter(csv_file, fieldnames=["name", "commit", "date", "commitId"])
        if not os.path.exists(report_csv_file):
            csv_writer.writeheader()
        csv_writer.writerow(entry)

    print("Code pushed successfully and report updated.")

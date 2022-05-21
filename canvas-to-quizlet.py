import re
import os.path


def convert(file: str) -> dict:
    questions = re.findall(r'"textarea_question_text">([\s\S]*?)<', file)
    answers = re.findall(
        r'"(.*?)(?:\.*?)(?:. This was the correct answer.|. You selected this answer. This was the correct answer.)', file)

    raw_pairs = dict(zip(questions, answers))
    pairs = {}

    for pair in raw_pairs:
        if '&lt' not in pair and 'All of the above' not in raw_pairs[pair]:
            pairs[pair] = raw_pairs[pair]

    pairs = {k: v for k, v in pairs.items() if len(v) >= 1}

    return pairs


def write_pairs(pairs: dict, location: str):
    with open(location, 'w', encoding="utf8") as f:
        for key in pairs.keys():
            f.write(f"{key}\t{pairs[key]}\n")


def main():
    input_path = input("Enter the Input File Path")
    split = os.path.split(input_path)
    output_path = split[0] + "/" + split[1].split('.')[0] + "-output.txt"

    file = open(input_path, "r", encoding="utf8").read().strip()

    pairs = convert(file)
    write_pairs(pairs, output_path)

    print(f'Flashcards written to {output_path}. To import into Quizlet:')


if __name__ == "__main__":
    main()

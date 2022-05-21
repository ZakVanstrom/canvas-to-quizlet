import os.path
from bs4 import BeautifulSoup as bs
import re
import time


def performance_test(func, args, repetitions=10, arg_list=None, name=None, print_times=True):
    def now(): return time.process_time()

    times = []
    t0 = now()
    for i in range(repetitions):
        t = now()
        if arg_list != None:
            args = arg_list[i]
        if type(args) is list:
            func(*args)
        else:
            func(args)
        times.append(now()-t)
    t1 = now()

    stats = {}
    stats['total'] = t1-t0
    stats['average'] = sum(times)/len(times)
    stats['low'] = min(times)
    stats['high'] = max(times)
    stats['range'] = stats['high'] - stats['low']

    stats = {k: "{:.2f}".format(stats[k]) for k in stats.keys()}
    time_strings = ["{:.2f}".format(t) for t in times]

    if name == None:
        print("Run Finished!")
    else:
        print(f"{name}: Run Finished")

    if print_times:
        print(f"\tTimes (s): {', '.join(time_strings)}")

    print(f"\tTotal Run Time: {stats['total']} seconds.")
    print(f"\tAverage was {stats['average']} seconds.")
    print(f"\tFastest Run was {stats['low']} seconds")
    print(f"\tSlowest was {stats['high']}.")
    print(f"\tRange of {stats['range']} seconds.")


def get_pairs(file, log=False) -> dict:
    scrape = bs(file)
    all_questions = scrape.select('div.text')
    pairs = []
    if log:
        print("Question Count: " + str(len(all_questions)))
    for q in all_questions:
        question_text = clean_up(
            q.find('div', class_='question_text user_content').text)
        answers = q.findAll('div', class_=["correct_answer"])
        if log:
            print("# Answers: " + str(len(answers)))
        answer_texts = []
        for a in answers:
            answer_texts.append(clean_up(a['title'], 'answer'))
        pairs.append([question_text, answer_texts])
    return pairs

# get pairs with Select
    # question_text = clean_up(q.select("div[class='question_text user_content']")[0].text)
    # answers = q.select('div[class="answer answer_for_ selected_answer correct_answer"]')


def clean_up(txt, object_type=''):
    txt = str(txt).strip().replace('\n', ' ').replace(
        ';', '.').replace('\t', ' ')
    if object_type == 'answer':
        txt = txt.replace(". This was the correct answer.", '')
        txt = txt.replace(". You selected this answer", '')
        txt = txt.replace(". You selected ", " --> ")
    return txt


def write_pairs(pairs: dict, location: str):
    with open(location, 'a+', encoding="utf8") as f:
        for pair in pairs:
            answer_as_text = '\n\n'.join(pair[1])
            f.write(f"{pair[0]}\t{answer_as_text};\n")


def write_html_file(file, path):
    f = open(path, 'w')
    f.write(file)


def get_output_path(input_path):
    split = os.path.split(input_path)
    out = split[0] + "/../output/" + split[1].split('.')[0] + "-output.txt"
    if os.path.exists(out):
        os.remove(out)
    return out


def get_HTML_paths_from_directory(dir_path):
    return [os.path.join(dir_path, f) for f in os.listdir(dir_path) if f.endswith(".html")]


def main():
    # html_paths = [input("Enter the Input File Path")]
    # html_paths = ["/Users/zak/dev/canvas-to-quizlet/examples/example_test_1.html"]
    html_paths = get_HTML_paths_from_directory(
        "/Users/zak/dev/canvas-to-quizlet/examples/original_html")

    output_path = get_output_path(
        "/Users/zak/dev/canvas-to-quizlet/examples/full-size-output.txt")

    # performance_test(do_run, [html_paths, output_path], repetitions=100, print_times=False)
    do_run(html_paths, output_path, log=True)


def do_run(html_paths, output_path, log=False):
    for f in html_paths:
        file = open(f, "r", encoding="utf8")
        content = file.read()
        file.close()
        pairs = get_pairs(content, log=log)
        if len(pairs) == 0:
            if log:
                print("Write Failed!")
            return
        output_path = get_output_path(f)
        write_pairs(pairs, output_path)
        if log:
            print('\n\n', f, f'\nWrote to {output_path}.')


if __name__ == "__main__":
    main()

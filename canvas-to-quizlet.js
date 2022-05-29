class CanvasToQuizletConverter {
     clean_up(txt) {
        let v = txt
        v = v.replace(/[\r\n]+/gm, " ").replace(';', '.').replace('\t', ' ');
        v = v.replace(". This was the correct answer.", "")
        v = v.replace(". You selected this answer", "")
        v = v.replace(". You selected ", " --> ")
        v = v.trim()
        return v
    }

    get_pairs(str) {
        var html = $($.parseHTML(str))
        var all_questions = $(html).find('div.text')
        var pairs = []
        var clean_up_var = this.clean_up
        $.each(all_questions, function(i, question) {
            let dirty_question_text = $(question).find('div.question_text, div.user_content').text()
            var question_text = clean_up_var(dirty_question_text)
            console.log(question_text, dirty_question_text)
            var answers = $(question).find('div.answer_for_')
            var answer_texts = []
            $.each(answers, function(i, answer) {
                var answer_string = answer.title
                if (!answer_string || answer_string.indexOf("correct answer") < 0) {
                    return
                }
                let cor_ans = ". The correct answer was "
                let ind = answer_string.indexOf(cor_ans)
                if (ind >= 0) {
                    let i1 = answer_string.indexOf(" You selected ")
                    let part1 = clean_up_var(answer_string.substring(0, i1))
                    let part2 = clean_up_var(answer_string.substring(i+cor_ans.len))
                    answer_string = part1 + " --> " + part2
                }
                answer_string = clean_up_var(answer_string)
                // console.log("\t"+answer_string)
                answer_texts.push(answer_string)
            })
            let cur_pair = [question_text, answer_texts]
            pairs.push(cur_pair)
        })
        return pairs
    }

    write_pairs(quiz_list) {
        var pair_lines = ""
        console.log(quiz_list)
        for (let q in quiz_list) {
            let question_list = quiz_list[q]
            for (let p in question_list) {
                let pair = question_list[p]
                console.log(pair)
                let answers_as_text = pair[1].join('\n\n')
                pair_lines += `${pair[0]}\t${answers_as_text};`
            }
        }
        console.log(pair_lines)
        return pair_lines
    }

    convert_file(content) {
        let pairs = this.get_pairs(content)
        if (!pairs) {
            return
        }
        return pairs
    }

    convert_filelist_to_pairs(file_list) {
        var pairs_list = []
        for (i in file_list) {
            let f = file_list[i]
            let pairs = this.convert_file(f)
            if (pairs) {
                pairs_list.push(pairs)
            }
        }
        return pairs_list
    }
}
class CanvasToQuizletConverter {
    constructor() {
        // Global Variables for Reporting
        var q_seen = 0
        var a_seen = 0
        var q_written = 0
        var a_written = 0
        var failure = 0
    
        // Options
        var log = false
        var advanced_log = false
        var set_view_results = false
        var write_to_single_file = false

        // Output
        var output_file = null
    }

    get_pairs(str) {
        var html = $.parseHTML(str)
        var all_questions = $(html).find('div.text')
        var pairs = []
        console.log(all_questions)
        for (let qi in all_questions) {
            let q = all_questions[qi]
            let dirty_text = $(q).find('div.question_text, div.user_content').text()
            var question_text = this.clean_up(dirty_text)
            var answers = $(q).find('div.answer_for_')
            var answer_texts = []
            for (let ai in answers) {
                let a = answers[ai]
                let answer_string = a.title
                if (!answer_string || answer_string.indexOf("correct answer") >= 0) {
                    continue
                }
                this.a_seen += 1
                let cor_ans = ". The correct answer was "
                let i = answer_string.indexOf(cor_ans)
                if (i >= 0) {
                    i1 = answer_string.find(" You selected ")
                    part1 = this.clean_up(answer_string.substring(0, i1))
                    part2 = this.clean_up(answer_string.substring(i+cor_ans.len))
                    answer_string = part1 + " --> " + part2
                }
                answer_texts.push(this.clean_up(answer_string, 'answer'))
            }
            pairs.push([question_text, answer_texts])
        }
        return pairs
    }

    clean_up(txt, object_type='') {
        txt = txt.replace('\n', '  ').replace(';', '.').replace('\t', ' ');
        if (object_type == 'answer') {
            txt = txt.replace(". This was the correct answer.", '')
            txt = txt.replace(". You selected this answer", '')
            txt = txt.replace(". You selected ", " --> ")
        }
        return txt.trim()
    }

    write_pairs(pairs) {
        var pairs_lines = ""
        for (let p in pairs) {
            let pair = pairs[p]
            let answer_as_text = pair[1].join('\n\n')
            pairs_lines += `${pair[0]}\t${answer_as_text};`
        }
        console.log(pairs_lines)
        // a.href = window.URL.createObjectURL(new Blob(["CONTENT"], {type: "text/plain"}));
        // a.download = "demo.txt";
        // a.click();
    }

    // main(){

    //     do_run(file, output_path=path)

    //     if (this.set_view_results) {
    //         console.this.log("File Count: ", len(html_paths))
    //         view_run_results()
    //     }
    // }

    // do_run(html_paths, output_path=null) {
    //     i = 1
    //     for (f in html_paths) {
    //         if (this.log) {
    //             console.this.log("\n\n", f.substring(55,100))
    //         }
    //         file = open(f, "r", encoding="utf8")
    //         content = file.read()
    //         file.close()
    //         pairs = get_pairs(content)
    //         if (!pairs) {
    //             this.failure += 1
    //             if (this.log){
    //                 console.this.log("Write Failed!")
    //             }
    //             continue
    //         }
    //         if (!(this.write_to_single_file && output_path)){
    //             output_path = get_output_path(f)
    //         }
    //         write_pairs(pairs, output_path)
    //         if (this.log) {
    //             console.this.log(`File ${i+1} : Wrote to ${output_path}.`)
    //         }
    //         f++
    //     }  
    // }

    convert_file(content) {
        let pairs = this.get_pairs(content)
        if (!pairs) {
            this.failure += 1
            if (this.log){
                console.this.log("Write Failed!")
            }
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

 

    // view_run_results() {
    //     console.this.log("\nRun Results:")
    //     console.this.log("   Questions Seen:", this.q_seen)
    //     console.this.log("   Questions Written", this.q_written)
    //     if (this.q_seen != this.q_written) {
    //         console.this.log("DISCREPANCY FOUND with QUESTIONS! A DIFFERENCE O",
    //             abs(this.q_seen, this.q_written))
    //     }
    //     console.this.log("   Answers Seen:", this.a_seen)
    //     console.this.log("   Answers Written", this.a_written)
    //     if (this.a_seen != this.a_written){
    //         console.this.log("DISCREPANCY FOUND with ANSWERS! A DIFFERENCE O",
    //             abs(this.a_seen-this.a_written))
    //     }
    //     console.this.log("   this.Failures:", this.failure)
    // }
}
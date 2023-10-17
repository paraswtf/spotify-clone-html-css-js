# Title: Simple cli todo list using classes (pls giv attendance :D) [no error handling for invalid input]
# PRN: 23030124026
# Name: Paras Deshpande
# Div: A
# Batch: BCA (23-27)


class ListItem:
    status = False
    task = ""

    def __init__(self, task):
        self.task = task
        self.status = False

    def mark_done(self):
        self.status = True

    def mark_undone(self):
        self.status = False


class TodoList:
    listitems = []

    def __init__(self):
        self.listitems = []

    def add_item(self, item):
        self.listitems.append(item)

    def remove_item(self, item):
        self.listitems.remove(item)

    def mark_done(self, item):
        item.mark_done()

    def mark_undone(self, item):
        item.mark_undone()

    def print_list(self, halt=True):
        clear()
        index = 0
        for item in self.listitems:
            print(
                str(index)
                + ") "
                + item.task
                + " - "
                + ("DONE" if item.status else "TODO")
            )
            index += 1
        if halt:
            input("Press enter to continue")


def clear():
    print("\n" * 100)


def menu():
    clear()
    print("TODO LIST")
    print("1. Add item")
    print("2. Remove item")
    print("3. Mark item done")
    print("4. Mark item undone")
    print("5. Print list")
    print("6. Exit")
    return input("Enter choice: ")


def main():
    todo_list = TodoList()
    while True:
        choice = menu()
        if choice == "1":
            item = input("Enter item: ")
            todo_list.add_item(ListItem(item))
        elif choice == "2":
            if len(todo_list.listitems) == 0:
                input("No items to remove. Press enter to continue")
                continue

            todo_list.print_list(False)
            itemIndex = input("Select item: ")
            item = todo_list.listitems[int(itemIndex)]
            todo_list.remove_item(item)
        elif choice == "3":
            if len(todo_list.listitems) == 0:
                input("No items to mark done. Press enter to continue")
                continue

            todo_list.print_list(False)
            itemIndex = input("Select item: ")
            item = todo_list.listitems[int(itemIndex)]
            todo_list.mark_done(item)
        elif choice == "4":
            if len(todo_list.listitems) == 0:
                input("No items to mark undone. Press enter to continue")
                continue

            todo_list.print_list(False)
            itemIndex = input("Select item: ")
            item = todo_list.listitems[int(itemIndex)]
            todo_list.mark_undone(item)
        elif choice == "5":
            todo_list.print_list()
        elif choice == "6":
            break
        else:
            print("Invalid choice")


main()

.PHONY: rpm deb

all: rpm deb

rpm:
				docker run --rm -it -v `pwd`/server:/root/rpmbuild/server \
					-v `pwd`/analytics:/root/rpmbuild/analytics \
					-v `pwd`/.git/HEAD:/root/rpmbuild/.git/HEAD \
					-v `pwd`/.git/refs:/root/rpmbuild/.git/refs \
					-v `pwd`/SPECS:/root/rpmbuild/SPECS \
					hastic/rpm-builder make -f rpm.make

deb:
				#
